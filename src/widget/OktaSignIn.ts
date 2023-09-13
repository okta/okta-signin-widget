/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigError } from 'util/Errors';
import Util from 'util/Util';
import Logger from 'util/Logger';
import getAuthClient from 'widget/getAuthClient';
import buildRenderOptions from 'widget/buildRenderOptions';
import createRouter from 'widget/createRouter';
import Hooks from 'models/Hooks';
import {
  WidgetOptions,
  WidgetOktaAuthConstructor,
  WidgetOktaAuthInterface,
  OktaSignInAPI,
  RenderSuccessCallback,
  RenderErrorCallback,
  RenderResult,
  RenderOptions,
  HookFunction,
  RenderResultSuccess,
  EventCallback,
  EventCallbackWithError,
  EventName,
  RouterClassFactory,
  AbstractRouter,
  RouterConstructor,
  OktaData,
} from '../types';
import { Tokens } from '@okta/okta-auth-js';

const EVENTS_LIST = ['ready', 'afterError', 'afterRender'];
declare global {
  interface Window {
    oktaData?: OktaData;
  }
}

export function createOktaSignIn
(
  authClientConstructor: WidgetOktaAuthConstructor,
  routerClassFactory: RouterClassFactory
)
{
  return class OktaSignIn implements OktaSignInAPI {
    Router: RouterConstructor;
    options: WidgetOptions;
    hooks: Hooks;
    router: AbstractRouter;
    authClient: WidgetOktaAuthInterface;
    // Map original event handler to wrapped one
    _eventCallbackMap: WeakMap<EventCallback | EventCallbackWithError, EventCallback | EventCallbackWithError>;

    constructor(options: WidgetOptions) {
      Util.debugMessage(`
          The Okta Sign-In Widget is running in development mode.
          When you are ready to publish your app, embed the minified version to turn on production mode.
          See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
        `);
      if (!options.stateToken) {
        // need to set stateToken here vs in Settings to determine Router.
        // oktaData is only available to SIW on custom domains.
        // set stateToken in case user wipes out stateToken when overriding options.
        options.stateToken = window?.oktaData?.signIn?.stateToken;
      }
      this.options = options;
      this.authClient = getAuthClient(authClientConstructor, options);

      // validate authClient configuration against widget options
      if (options.useClassicEngine !== true && this.authClient.options.clientId && this.authClient.isPKCE() === false) {
        throw new ConfigError(
          'OAuth2 with interaction code flow requires PKCE to be enabled on the authClient.'
        );
      }

      // Hooks can be modified before or after render
      this.hooks = new Hooks({
        hooks: options.hooks
      });

      this.Router = routerClassFactory(options);

      this._eventCallbackMap = new WeakMap();

      // Triggers the event up the chain so it is available to the consumers of the widget.
      this.Router.prototype.Events.listenTo.call(this, this.Router.prototype, 'all', this.trigger);

      // On the first afterRender event (usually when the Widget is ready) - emit a 'ready' event
      this.once('afterRender', function(context) {
        this.trigger('ready', context);
      });
    }

    /**
     * Render the sign in widget to an element. Returns a promise that will resolve on success or reject on error.
     * @param options - options for the signin widget.
     *        Must have an el or $el property to render the widget to.
     * @param success - success callback function
     * @param error - error callback function
     */
    renderEl(renderOptions: RenderOptions, successFn?: RenderSuccessCallback, errorFn?: RenderErrorCallback): Promise<RenderResult> {
      if (this.router) {
        throw new Error('An instance of the widget has already been rendered. Call remove() first.');
      }

      const res = createRouter(this.Router, this.options, renderOptions, this.authClient, successFn, errorFn, this.hooks);
      this.router = res.router;
      return res.promise;
    }

    
    hide(): void {
      if (this.router) {
        this.router.hide();
      }
    }

    show(): void {
      if (this.router) {
        this.router.show();
      }
    }

    remove(): void {
      if (this.router) {
        this.router.remove();
        this.router = undefined;
      }
    }

    /**
     * Renders the Widget and returns a promise that resolves to OAuth tokens
     * @param options - options for the signin widget
     */
    showSignInToGetTokens(options?: RenderOptions): Promise<Tokens> {
      const renderOptions = Object.assign(buildRenderOptions(this.options, options), {
        redirect: 'never'
      });
      const promise = this.renderEl(renderOptions).then(res => {
        return (res as RenderResultSuccess).tokens;
      });
      const authClient = this.router.settings.getAuthClient();
      if (authClient.isAuthorizationCodeFlow() && !authClient.isPKCE()) {
        throw new ConfigError('"showSignInToGetTokens()" should not be used for authorization_code flow. ' + 
          'Use "showSignInAndRedirect()" instead');
      }
      return promise;
    }

    /**
     * Renders the widget and redirects to the OAuth callback
     * @param options - options for the signin widget
     */
    showSignInAndRedirect(options?: RenderOptions): Promise<void> {
      const renderOptions = Object.assign(buildRenderOptions(this.options, options), {
        redirect: 'always'
      });
      return this.renderEl(renderOptions).then(() => {
        // This method should never return, it will either redirect or reject with error
        return;
      });
    }

    /**
     * Renders the widget. Either resolves the returned promise, or redirects.
     * @param options - options for the signin widget
     */
    showSignIn(options?: RenderOptions): Promise<RenderResult> {
      const renderOptions = Object.assign(buildRenderOptions(this.options, options));
      return this.renderEl(renderOptions);
    }

    // Hook convenience functions
    before(formName: string, callbackFn: HookFunction): void {
      this.hooks.mergeHook(formName, {
        before: [
          callbackFn
        ]
      });
    }

    after(formName: string, callbackFn: HookFunction): void {
      this.hooks.mergeHook(formName, {
        after: [
          callbackFn
        ]
      });
    }

    getUser(): any {
      return this.router?.appState?.getUser();
    }
    
    // Events API

    on(event: EventName, callback: EventCallback | EventCallbackWithError): void {
      // custom events listener on widget instance to trap third-party callback errors
      if (EVENTS_LIST.includes(event)) {
        const origCallback = callback;
        callback = function(...callbackArgs) {
          try {
            origCallback.apply(this, callbackArgs);
          } catch (err) {
            Logger.error(`[okta-signin-widget] "${event}" event handler error:`, err);
          }
        };
        this._eventCallbackMap.set(origCallback, callback);
      }
      this.Router.prototype.Events.on.call(this, event, callback);
    }

    off(event?: EventName, callback?: EventCallback | EventCallbackWithError): void {
      if (callback) {
        callback = this._eventCallbackMap.get(callback) || callback;
      }
      this.Router.prototype.Events.off.call(this, event, callback);
    }

    once(event: EventName, callback: EventCallback): void {
      this.Router.prototype.Events.once.call(this, event, callback);
    }

    stopListening(event?: EventName, callback?: EventCallback): void {
      this.Router.prototype.Events.stopListening.call(this, event, callback);
    }

    listenTo(object: any, event: EventName, callback: EventCallback): void {
      this.Router.prototype.Events.listenTo.call(this, object, event, callback);
    }

    trigger(event: EventName, ...args: any[]): void {
      this.Router.prototype.Events.trigger.apply(this, [event, ...args]);
    }

  };
}

import _ from 'underscore';
import Errors from 'util/Errors';
import Util from 'util/Util';
import Logger from 'util/Logger';
import createAuthClient from 'widget/createAuthClient';
import buildRenderOptions from 'widget/buildRenderOptions';
import createRouter from 'widget/createRouter';
import V1Router from 'LoginRouter';
import V2Router from 'v2/WidgetRouter';
import Hooks from 'models/Hooks';

const EVENTS_LIST = ['ready', 'afterError', 'afterRender'];

var OktaSignIn = (function() {

  var router;

  function getProperties(authClient, hooks, Router, widgetOptions = {}) {
    // Returns a promise that will resolve on success or reject on error
    function render(renderOptions, successFn, errorFn) {
      if (router) {
        throw new Error('An instance of the widget has already been rendered. Call remove() first.');
      }

      const res = createRouter(Router, widgetOptions, renderOptions, authClient, successFn, errorFn, hooks);
      router = res.router;
      return res.promise;
    }

    function hide() {
      if (router) {
        router.hide();
      }
    }

    function show() {
      if (router) {
        router.show();
      }
    }

    function remove() {
      if (router) {
        router.remove();
        router = undefined;
      }
    }

    /**
     * Renders the Widget and returns a promise that resolves to OAuth tokens
     * @param options - options for the signin widget
     */
    function showSignInToGetTokens(options = {}) {
      const renderOptions = Object.assign(buildRenderOptions(widgetOptions, options), {
        redirect: 'never'
      });
      const promise = this.renderEl(renderOptions).then(res => {
        return res.tokens;
      });
      const authClient = router.settings.getAuthClient();
      if (authClient.isAuthorizationCodeFlow() && !authClient.isPKCE()) {
        throw new Errors.ConfigError('"showSignInToGetTokens()" should not be used for authorization_code flow. ' + 
          'Use "showSignInAndRedirect()" instead');
      }
      return promise;
    }

    /**
     * Renders the widget and redirects to the OAuth callback
     * @param options - options for the signin widget
     */
    function showSignInAndRedirect(options = {}) {
      const renderOptions = Object.assign(buildRenderOptions(widgetOptions, options), {
        redirect: 'always'
      });
      return this.renderEl(renderOptions);
    }

    /**
     * Renders the widget. Either resolves the returned promise, or redirects.
     * @param options - options for the signin widget
     */
    function showSignIn(options = {}) {
      const renderOptions = Object.assign(buildRenderOptions(widgetOptions, options));
      return this.renderEl(renderOptions);
    }

    // Hook convenience functions
    function before(formName, callbackFn) {
      hooks.mergeHook(formName, {
        before: [
          callbackFn
        ]
      });
    }

    function after(formName, callbackFn) {
      hooks.mergeHook(formName, {
        after: [
          callbackFn
        ]
      });
    }

    function getUser() {
      return router?.appState?.getUser();
    }

    // Properties exposed on OktaSignIn object.
    return {
      renderEl: render,
      authClient: authClient,
      showSignIn,
      showSignInToGetTokens,
      showSignInAndRedirect,
      hide,
      show,
      remove,
      before,
      after,
      getUser,
    };
  }

  /**
   * Render the sign in widget to an element.
   * @param options - options for the signin widget.
   *        Must have an el or $el property to render the widget to.
   * @param success - success callback function
   * @param error - error callback function
   */
  function OktaSignIn(options) {
    Util.debugMessage(`
        The Okta Sign-In Widget is running in development mode.
        When you are ready to publish your app, embed the minified version to turn on production mode.
        See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
      `);

    var authParams = _.extend({
      clientId: options.clientId,
      redirectUri: options.redirectUri,
      state: options.state,
      scopes: options.scopes
    }, options.authParams);

    if (!authParams.issuer) {
      authParams.issuer = options.baseUrl + '/oauth2/default';
    }

    var authClient = options.authClient ? options.authClient : createAuthClient(authParams);
    if (!authClient._oktaUserAgent) {
      throw new Errors.ConfigError('The passed in authClient should be version 5.4.0 or above.');
    } else {
      authClient._oktaUserAgent.addEnvironment(`okta-signin-widget-${config.version}`);
    }

    // validate authClient configuration against widget options
    if (options.useInteractionCodeFlow  && authClient.isPKCE() === false) {
      throw new Errors.ConfigError(
        'The "useInteractionCodeFlow" option requires PKCE to be enabled on the authClient.'
      );
    }

    // Hooks can be modified before or after render
    var hooks = new Hooks({
      hooks: options.hooks
    });

    var Router;
    if ((options.stateToken && !Util.isV1StateToken(options.stateToken)) 
        // Self hosted widget can use `useInteractionCodeFlow` to use V2Router
        || options.useInteractionCodeFlow 
        || options.proxyIdxResponse) {
      Router = V2Router;
    } else {
      Router = V1Router;
    }

    _.extend(this, Router.prototype.Events, {
      on: function(...onArgs) {
        // custom events listener on widget instance to trap third-party callback errors
        const [event, callback] = onArgs;
        if (EVENTS_LIST.includes(event)) {
          onArgs[1] = function(...callbackArgs) {
            try {
              callback.apply(this, callbackArgs);
            } catch (err) {
              Logger.error(`[okta-signin-widget] "${event}" event handler error:`, err);
            }
          };
        }
        Router.prototype.Events.on.apply(this, onArgs);
      }
    });
    _.extend(this, getProperties(authClient, hooks, Router, options));

    // Triggers the event up the chain so it is available to the consumers of the widget.
    this.listenTo(Router.prototype, 'all', this.trigger);

    // On the first afterRender event (usually when the Widget is ready) - emit a 'ready' event
    this.once('afterRender', function(context) {
      this.trigger('ready', context);
    });
  }

  return OktaSignIn;
})();
module.exports = OktaSignIn;

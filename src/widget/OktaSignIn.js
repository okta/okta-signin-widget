/*globals module, Promise */
import _ from 'underscore';
import Errors from 'util/Errors';
import Util from 'util/Util';
import OAuth2Util from 'util/OAuth2Util';
import createAuthClient from 'widget/createAuthClient';
import V1Router from 'LoginRouter';
import V2Router from 'v2/WidgetRouter';

var OktaSignIn = (function () {

  var router;

  function getProperties (authClient, Router, widgetOptions = {}) {
    // Returns a promise that will resolve on success or reject on error
    function render (renderOptions, successFn, errorFn) {
      if (router) {
        throw new Error('An instance of the widget has already been rendered. Call remove() first.');
      }

      return new Promise((resolve, reject) => {
        router = new Router(
          _.extend({}, widgetOptions, renderOptions, {
            authClient: authClient,
            globalSuccessFn: (res) => {
              successFn && successFn(res); // call success function if provided
              resolve(res);
            },
            globalErrorFn: (error) => {
              errorFn && errorFn(error); // call error function if provided
              reject(error);
            }
          })
        );
        router.start();
      });
    }

    function hide () {
      if (router) {
        router.hide();
      }
    }

    function show () {
      if (router) {
        router.show();
      }
    }

    function remove () {
      if (router) {
        router.remove();
        router = undefined;
      }
    }

    function buildRenderOptions (options = {}) {
      const authParams = _.pick(options, OAuth2Util.AUTH_PARAMS);
      const { el, clientId, redirectUri } = Object.assign({}, widgetOptions, options);
      const renderOptions = Object.assign({}, { el, clientId, redirectUri, authParams });

      if (!renderOptions.el) {
        throw new Errors.ConfigError('"el" is required');
      }

      if (!renderOptions.clientId) {
        throw new Errors.ConfigError('"clientId" is required');
      }

      if (!renderOptions.redirectUri) {
        throw new Errors.ConfigError('"redirectUri" is required');
      }

      return renderOptions;
    }

    /**
     * Renders the Widget and returns a promise that resolvess to OAuth tokens
     * @param options - options for the signin widget
     */
    function showSignInToGetTokens (options = {}) {
      const renderOptions = Object.assign(buildRenderOptions(options), {
        mode: 'relying-party'
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
    function showSignInAndRedirect (options = {}) {
      const renderOptions = Object.assign(buildRenderOptions(options), {
        mode: 'remediation'
      });
      return this.renderEl(renderOptions);
    }

    // Properties exposed on OktaSignIn object.
    return {
      renderEl: render,
      authClient: authClient,
      showSignInToGetTokens,
      showSignInAndRedirect,
      hide,
      show,
      remove,
    };
  }

  /**
   * Render the sign in widget to an element.
   * @param options - options for the signin widget.
   *        Must have an el or $el property to render the widget to.
   * @param success - success callback function
   * @param error - error callback function
   */
  function OktaSignIn (options) {
    Util.debugMessage(`
        The Okta Sign-In Widget is running in development mode.
        When you are ready to publish your app, embed the minified version to turn on production mode.
        See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
      `);

    var authParams = _.extend({
      clientId: options.clientId,
      redirectUri: options.redirectUri
    }, options.authParams);

    if (!authParams.issuer) {
      authParams.issuer = options.baseUrl + '/oauth2/default';
    }

    var authClient = options.authClient ? options.authClient : createAuthClient(authParams);

    // validate authClient configuration against widget options
    if (options.useInteractionCodeFlow && authClient.isPKCE() === false) {
      throw new Errors.ConfigError(
        'The "useInteractionCodeFlow" option requires PKCE to be enabled on the authClient.'
      );
    }

    var Router;
    if ((options.stateToken && !Util.isV1StateToken(options.stateToken)) 
        // Self hosted widget can use this flag to use V2Router
        || options.useInteractionCodeFlow 
        || options.proxyIdxResponse) {
      Router = V2Router;
    } else {
      Router = V1Router;
    }

    _.extend(this, Router.prototype.Events);
    _.extend(this, getProperties(authClient, Router, options));

    // Triggers the event up the chain so it is available to the consumers of the widget.
    this.listenTo(Router.prototype, 'all', this.trigger);

    // On the first afterRender event (usually when the Widget is ready) - emit a 'ready' event
    this.once('afterRender', function (context) {
      this.trigger('ready', context);
    });
  }

  return OktaSignIn;
})();
module.exports = OktaSignIn;

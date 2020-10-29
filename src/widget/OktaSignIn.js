/*globals module */
import _ from 'underscore';
import config from 'config/config.json';
import OAuth2Util from 'util/OAuth2Util';
import Util from 'util/Util';
import createAuthClient from 'widget/createAuthClient';
import V1Router from 'LoginRouter';
import V2Router from 'v2/WidgetRouter';
import V3Router from 'v2/DeviceEnrollmentRouter.js';

var OktaSignIn = (function () {

  var router;

  function getProperties (authClient, Router, widgetOptions = {}) {
    function render (renderOptions, successFn, errorFn) {
      if (router) {
        throw new Error('An instance of the widget has already been rendered. Call remove() first.');
      }

      /**
       * -- Development Mode --
       * When the page loads, provide a helpful message to remind the developer that
       * tokens have not been removed from the hash fragment.
       */
      if (this.hasTokensInUrl()) {
        Util.debugMessage(`
            Looks like there are still tokens in the URL! Don't forget to parse and store them.
            See: https://github.com/okta/okta-signin-widget/#hastokensinurl
          `);
      }

      router = new Router(
        _.extend({}, widgetOptions, renderOptions, {
          authClient: authClient,
          globalSuccessFn: successFn,
          globalErrorFn: errorFn,
        })
      );
      router.start();
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

    /**
     * Check if tokens or a code have been passed back into the url, which happens in
     * the social auth IDP redirect flow.
     */
    function hasTokensInUrl () {
      var authParams = this.authClient.options;
      if (authParams.pkce || authParams.responseType === 'code' || authParams.responseMode === 'query') {
        // Look for code
        return authParams.responseMode === 'fragment'
          ? Util.hasCodeInUrl(window.location.hash)
          : Util.hasCodeInUrl(window.location.search);
      }
      // Look for tokens (Implicit OIDC flow)
      return Util.hasTokensInHash(window.location.hash);
    }

    /**
     * Renders the Widget with opinionated defaults for the full-page
     * redirect flow.
     * @param options - options for the signin widget
     */
    function showSignInToGetTokens (options) {
      var renderOptions = OAuth2Util.transformShowSignInToGetTokensOptions(options, config);
      return render.call(this, renderOptions);
    }

    // Properties exposed on OktaSignIn object.
    return {
      renderEl: render,
      authClient: authClient,
      showSignInToGetTokens: showSignInToGetTokens,
      hasTokensInUrl: hasTokensInUrl,
      hide: hide,
      show: show,
      remove: remove,
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

    var authClient = createAuthClient(authParams);

    var Router;
    if (options.deviceEnrollment && options.deviceEnrollment.name) {
      Router = V3Router;
    } else if (options.stateToken && !Util.isV1StateToken(options.stateToken)) {
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

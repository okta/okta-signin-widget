/*globals module */

var OktaSignIn = (function () {

  var _        = require('underscore'),
      config   = require('config/config.json'),
      OAuth2Util = require('util/OAuth2Util'),
      router;
  var V1LoginRouter = require('LoginRouter');

  function getProperties (authClient, Util, widgetOptions = {}) {

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
        Util.debugMessage(
          `
            Looks like there are still tokens in the URL! Don't forget to parse and store them.
            See: https://github.com/okta/okta-signin-widget/#hastokensinurl
          `
        );
      }
      var isNewPipeline = !Util.isV1StateToken(widgetOptions.stateToken);
      var Router = V1LoginRouter;
      if (widgetOptions.stateToken && isNewPipeline) {
        /* add check for stateToken here because we dont want to end up on
        new pipeline if there is no stateToken */
        Router = require('v2/WidgetRouter');
      }
      if (widgetOptions.stateToken) {
        Util.introspectToken(authClient, widgetOptions)
          .then(_.bind(function (response) {
            router = bootstrapRouter.call(this, Router, authClient, widgetOptions, renderOptions, successFn, errorFn);
            router.appState.set('introspectSuccess', response);
            router.start();
          }, this)).catch(_.bind(function (err) {
          // Introspect API error.
          // Incase of an error we want to just load the LoginRouter
            router = bootstrapRouter.call(this, Router, authClient, widgetOptions, renderOptions, successFn, errorFn);
            var introspectError = isNewPipeline ? err.details: err;
            /* idx-js sends an error object with the error response inside details
            https://github.com/okta/okta-idx-js/blob/master/src/index.js#L14*/
            router.appState.set('introspectError', introspectError);
            router.start();
          }, this));
      } else {
        // If no stateToken bootstrap with LoginRouter
        router = bootstrapRouter.call(this, Router, authClient, widgetOptions, renderOptions, successFn, errorFn);
        router.start();
      }
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
        return authParams.responseMode === 'fragment' ?
          Util.hasCodeInUrl(window.location.hash) :
          Util.hasCodeInUrl(window.location.search);
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
      remove: remove
    };
  }

  function bootstrapRouter (Router, authClient, widgetOptions, renderOptions, successFn, errorFn) {
    var widgetRouter = new Router(_.extend({}, widgetOptions, renderOptions, {
      authClient: authClient,
      globalSuccessFn: successFn,
      globalErrorFn: errorFn
    }));

    _.extend(this, Router.prototype.Events);

    // Triggers the event up the chain so it is available to the consumers of the widget.
    this.listenTo(Router.prototype, 'all', this.trigger);

    // On the first afterRender event (usually when the Widget is ready) - emit a 'ready' event
    this.once('afterRender', function (context) {
      this.trigger('ready', context);
    });
    return widgetRouter;
  }

  function OktaSignIn (options) {
    require('okta');
    var Util = require('util/Util');
    /**
     * Render the sign in widget to an element.
     * @param options - options for the signin widget.
     *        Must have an el or $el property to render the widget to.
     * @param success - success callback function
     * @param error - error callback function
     */
    var OktaAuth = require('@okta/okta-auth-js');

    var authParams = _.extend({
      transformErrorXHR: Util.transformErrorXHR,
      headers: {
        'X-Okta-User-Agent-Extended': 'okta-signin-widget-' + config.version
      },
      clientId: options.clientId,
      redirectUri: options.redirectUri
    }, options.authParams);

    if (!authParams.issuer) {
      authParams.issuer = options.baseUrl + '/oauth2/default';
    }

    var authClient = new OktaAuth(authParams);

    Util.debugMessage(
      `
        The Okta Sign-In Widget is running in development mode.
        When you are ready to publish your app, embed the minified version to turn on production mode.
        See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
      `
    );

    _.extend(this, V1LoginRouter.prototype.Events, getProperties(authClient, Util, options));
  }

  return OktaSignIn;

})();
module.exports = OktaSignIn;

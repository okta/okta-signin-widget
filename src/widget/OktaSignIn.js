/*globals module */

var OktaSignIn = (function () {

  var _        = require('underscore'),
      config   = require('config/config.json'),
      OAuth2Util = require('util/OAuth2Util'),
      LoginRouter = require('LoginRouter'),
      router;

  function getProperties (Util, widgetOptions) {

    /**
     * Render the sign in widget to an element.
     * @param options - options for the signin widget.
     *        Must have an el or $el property to render the widget to.
     * @param success - success callback function
     * @param error - error callback function
     */
    var OktaAuth = require('@okta/okta-auth-js');

    var authClient = new OktaAuth({
      url: widgetOptions.baseUrl,
      transformErrorXHR: Util.transformErrorXHR,
      headers: {
        'X-Okta-User-Agent-Extended': 'okta-signin-widget-' + config.version
      },
      clientId: widgetOptions.clientId,
      redirectUri: widgetOptions.redirectUri
    });

    function render (renderOptions, successFn, errorFn) {
      if (router) {
        throw new Error('An instance of the widget has already been rendered. Call remove() first.');
      }

      /**
       * -- Development Mode --
       * When the page loads, provide a helpful message to remind the developer that
       * tokens have not been removed from the hash fragment.
       */
      if (hasTokensInUrl()) {
        Util.debugMessage(
          `
            Looks like there are still tokens in the URL! Don't forget to parse and store them.
            See: https://github.com/okta/okta-signin-widget/#oidc-tokenparsetokensfromurlsuccess-error.
          `
        );
      }
      if (widgetOptions.stateToken) {
        Util.introspectToken(authClient, widgetOptions)
          .then(_.bind(function (response) {
            var isNewPipeline = checkResponseVersion(response);
            var Router = isNewPipeline ? require('v2/WidgetRouter') : require('LoginRouter');
            router = new Router(_.extend({}, widgetOptions, renderOptions, {
              authClient: authClient,
              globalSuccessFn: successFn,
              globalErrorFn: errorFn
            }));

            router.start();

            _.extend(this, Router.prototype.Events);

            // Triggers the event up the chain so it is available to the consumers of the widget.
            this.listenTo(Router.prototype, 'all', this.trigger);

            // On the first afterRender event (usually when the Widget is ready) - emit a 'ready' event
            this.once('afterRender', function (context) {
              this.trigger('ready', context);
            });

            if (isNewPipeline) {
              router.settings.unset('stateToken');
              router.appState.set('remediationSuccess', response);
            } else {
              router.appState.set('transaction', response);
            }
          }, this)).fail(_.bind(function (err) {
          //Introspect API error.
          // Incase of an error we want to just load the V1 router
            loadV1Router.call(this, authClient, widgetOptions, renderOptions, successFn, errorFn);
            router.navigate('', { trigger: true });
            router.appState.set('transactionError', err);
          }, this));
      } else {
        loadV1Router.call(this, authClient, widgetOptions, renderOptions, successFn, errorFn);
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
     * Check if tokens have been passed back into the url, which happens in
     * the social auth IDP redirect flow.
     */
    function hasTokensInUrl () {
      return Util.hasTokensInHash(window.location.hash);
    }

    /**
     * Renders the Widget with opinionated defaults for the full-page
     * redirect flow.
     * @param options - options for the signin widget
     */
    function showSignInToGetTokens (options) {
      var renderOptions = OAuth2Util.transformShowSignInToGetTokensOptions(options, config);
      return render(renderOptions);
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

  function checkResponseVersion (response) {
    response.version = '1.0.0';
    return !!(response.version && response.version === '1.0.0');
  }
  function loadV1Router (authClient, widgetOptions, renderOptions, successFn, errorFn) {
    router = new LoginRouter(_.extend({}, widgetOptions, renderOptions, {
      authClient: authClient,
      globalSuccessFn: successFn,
      globalErrorFn: errorFn
    }));

    router.start();

    _.extend(this, LoginRouter.prototype.Events);

    // Triggers the event up the chain so it is available to the consumers of the widget.
    this.listenTo(LoginRouter.prototype, 'all', this.trigger);

    // On the first afterRender event (usually when the Widget is ready) - emit a 'ready' event
    this.once('afterRender', function (context) {
      this.trigger('ready', context);
    });

  }
  function OktaSignIn (options) {
    require('okta');
    var Util = require('util/Util');

    Util.debugMessage(
      `
        The Okta Sign-In Widget is running in development mode.
        When you are ready to publish your app, embed the minified version to turn on production mode.
        See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
      `
    );

    _.extend(this, getProperties(Util, options));

  }

  return OktaSignIn;

})();
module.exports = OktaSignIn;

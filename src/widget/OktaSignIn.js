/*globals module */

var OktaSignIn = (function () {

  var _        = require('underscore'),
      config   = require('config/config.json'),
      OAuth2Util = require('util/OAuth2Util');

  function getProperties (authClient, LoginRouter, Util, config) {

    /**
     * Check if a session exists
     * @param callback - callback function invoked with 'true'/'false' as the argument.
     */
    function checkSession (callback) {
      authClient.session.exists().then(callback);
    }

    /**
     * Close the current session (sign-out). Callback is invoked with an error message
     * if the operation was not successful.
     * @param callback - function to invoke after closing the session.
     */
    function closeSession (callback) {
      authClient.session.close().then(callback)
        .fail(function () {
          callback('There was a problem closing the session');
        });
    }

    /**
     * Keep-alive for the session. The callback is invoked with the object containing
     * the session if successful and {status: 'INACTIVE'} if it is not successful.
     * @param callback - function to invoke after refreshing the session.
     */
    function refreshSession (callback) {
      authClient.session.refresh().then(callback)
        .fail(function () {
          callback({status: 'INACTIVE'});
        });
    }

    /**
     * Check if there is an active session. If there is one, the callback is invoked with
     * the session and user information (similar to calling the global success callback)
     * and if not, the callback is invoked with {status: 'INACTIVE'}, at which point,
     * the widget can be rendered using renderEl().
     * @param callback - function to invoke after checking if there is an active session.
     */
    function getSession (callback) {
      authClient.session.get()
        .then(function (res) {
          if (res.status === 'ACTIVE' && res.user) {
          // only include the attributes that are passed into the successFn on primary auth.
            res.user = _.pick(res.user, 'id', 'profile', 'passwordChanged');
          }
          callback(res);
        });
    }

    /**
     * Render the sign in widget to an element.
     * @param options - options for the signin widget.
     *        Must have an el or $el property to render the widget to.
     * @param success - success callback function
     * @param error - error callback function
     */
    var router;
    function render (options, success, error) {
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

      router = new LoginRouter(_.extend({}, config, options, {
        authClient: authClient,
        globalSuccessFn: success,
        globalErrorFn: error
      }));
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
     * Check if tokens have been passed back into the url, which happens in
     * the social auth IDP redirect flow.
     */
    function hasTokensInUrl () {
      return Util.hasTokensInHash(window.location.hash);
    }

    /**
     * Parses tokens from the url.
     * @param success - success callback function (usually the same as passed to render)
     * @param error - error callback function (usually the same as passed to render)
     */
    function parseTokensFromUrl (success, error) {
      authClient.token.parseFromUrl()
        .then(success)
        .fail(error);
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

    /**
     * Returns authentication transaction information given a stateToken.
     * @param {String} stateToken - Ephemeral token that represents the current state of an authentication
     *                              or recovery transaction
     * @returns {Promise} - Returns a promise for an object containing the transaction information
     */
    function getTransaction (stateToken) {
      if (!stateToken) {
        throw new Error('A state token is required.');
      }
      return authClient.tx.resume({ stateToken: stateToken });
    }

    // Properties exposed on OktaSignIn object.
    return {
      renderEl: render,
      showSignInToGetTokens: showSignInToGetTokens,
      signOut: closeSession,
      session: {
        close: closeSession,
        exists: checkSession,
        get: getSession,
        refresh: refreshSession
      },
      token: {
        hasTokensInUrl: hasTokensInUrl,
        parseTokensFromUrl: parseTokensFromUrl
      },
      tokenManager: authClient.tokenManager,
      getTransaction: getTransaction,
      hide: hide,
      show: show,
      remove: remove
    };
  }

  function OktaSignIn (options) {
    require('okta');

    var OktaAuth = require('@okta/okta-auth-js/jquery');
    var Util = require('util/Util');
    var LoginRouter = require('LoginRouter');

    Util.debugMessage(
      `
        The Okta Sign-In Widget is running in development mode.
        When you are ready to publish your app, embed the minified version to turn on production mode.
        See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
      `
    );

    var authClient = new OktaAuth({
      url: options.baseUrl,
      transformErrorXHR: Util.transformErrorXHR,
      headers: {
        'X-Okta-User-Agent-Extended': 'okta-signin-widget-' + config.version
      },
      clientId: options.clientId,
      redirectUri: options.redirectUri
    });
    _.extend(this, LoginRouter.prototype.Events, getProperties(authClient, LoginRouter, Util, options));

    // Triggers the event up the chain so it is available to the consumers of the widget.
    this.listenTo(LoginRouter.prototype, 'all', this.trigger);

    // On the first afterRender event (usually when the Widget is ready) - emit a 'ready' event
    this.once('afterRender', function (context) {
      this.trigger('ready', context);
    });
  }

  return OktaSignIn;

})();
module.exports = OktaSignIn;

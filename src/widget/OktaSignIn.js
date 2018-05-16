/*globals module */

var OktaSignIn = (function () {

  var config  = require('json!config/config'),
      _ = require('okta/underscore');

  function getProperties(authClient, LoginRouter, Util, config) {

    /**
     * Check if a session exists
     * @param callback - callback function invoked with 'true'/'false' as the argument.
     */
    function checkSession(callback) {
      authClient.session.exists().then(callback);
    }

    /**
     * Close the current session (sign-out). Callback is invoked with an error message
     * if the operation was not successful.
     * @param callback - function to invoke after closing the session.
     */
    function closeSession(callback) {
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
    function refreshSession(callback) {
      authClient.session.refresh().then(callback)
      .fail(function() {
        callback({status: 'INACTIVE'});
      });
    }

    /**
     * Refresh the idToken
     * @param idToken - idToken generated from the OAUTH call
     * @param callback - function to invoke after refreshing the idToken.
     *        The callback will be passed a new idToken if successful and
     *        an error message if not.
     * @param opts - OAUTH options to refresh the idToken
     */
    function refreshIdToken(idToken, callback, opts) {
      authClient.idToken.refresh(opts).then(callback)
      .fail(function () {
        callback('There was a problem refreshing the id_token');
      });
    }

    /**
     * Check if there is an active session. If there is one, the callback is invoked with
     * the session and user information (similar to calling the global success callback)
     * and if not, the callback is invoked with {status: 'INACTIVE'}, at which point,
     * the widget can be rendered using renderEl().
     * @param callback - function to invoke after checking if there is an active session.
     */
    function getSession(callback) {
      authClient.session.get()
      .then(function(res) {
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
    function render(options, success, error) {
      if (router) {
        throw 'An instance of the widget has already been rendered. Call remove() first.';
      }
      router = new LoginRouter(_.extend({}, config, options, {
        authClient: authClient,
        globalSuccessFn: success,
        globalErrorFn: error
      }));
      router.start();
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
     * Check if tokens have been passed back into the url, which happens in
     * the social auth IDP redirect flow.
     */
    function hasTokensInUrl() {
      return Util.hasTokensInHash(window.location.hash);
    }

    /**
     * Parses tokens from the url.
     * @param success - success callback function (usually the same as passed to render)
     * @param error - error callback function (usually the same as passed to render)
     */
    function parseTokensFromUrl(success, error) {
      authClient.token.parseFromUrl()
      .then(success)
      .fail(error);
    }

    // Properties exposed on OktaSignIn object.
    return {
      renderEl: render,
      signOut: closeSession,
      authClient: authClient,
      idToken: {
        refresh: refreshIdToken
      },
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
      hide: hide,
      show: show,
      remove: remove
    };
  }

  function OktaSignIn(options) {
    var OktaAuth, Util, authClient, LoginRouter, Logger;

    // Modify the underscore, handlebars, and jquery modules
    // Remove once these are explicitly required in Courage
    require('okta/underscore');
    require('okta/handlebars');
    require('okta/jquery');

    OktaAuth = require('@okta/okta-auth-js/jquery');
    Util = require('util/Util');
    LoginRouter = require('LoginRouter');
    Logger = require('util/Logger');

    Logger.warn(
      `
        The Okta Sign-In Widget is running in development mode.
        When you are ready to publish your app, embed the minified version to turn on production mode.
        See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
      `
    );

    authClient = new OktaAuth({
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

  }

  return OktaSignIn;

})();

module.exports = OktaSignIn;

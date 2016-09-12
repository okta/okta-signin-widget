/*globals module, __webpack_modules__, WIDGET_VERSION */
/*jshint unused:false, camelcase: false */

var OktaSignIn = (function () {

  var _ = require('underscore');

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
    function render(options, success, error) {
      var router = new LoginRouter(_.extend({}, config, options, {
        authClient: authClient,
        globalSuccessFn: success,
        globalErrorFn: error
      }));
      router.start();
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
      tokenManager: authClient.tokenManager
    };
  }

  function OktaSignIn(options) {
    var OktaAuth, Util, authClient, LoginRouter;

    // Labels are special - we need to create a custom Bundles module
    // to easily extend our existing properties. Other widget options should be
    // passed through a normal function call (like LoginRouter below).

    // Create copies of the label and country
    // options so we can safely delete them
    var labelsOptions = _.clone(options.labels);
    var countryOptions = _.clone(options.country);
    delete options.labels;
    delete options.country;

    // Dynamically create a Bundles module so we can extend it
    var bundleIdModule = require.resolve('shared/util/Bundles');
    __webpack_modules__[bundleIdModule] = function(module) {
      var login = require('i18n!nls/login');
      var country = require('i18n!nls/country');

      module.exports = {
        login: _.extend(login, labelsOptions),
        country: _.extend(country, countryOptions)
      };
    };

    // Modify the underscore, handlebars, and jquery modules
    // Remove once these are explicitly required in Courage
    require('vendor/lib/underscore-wrapper');
    require('vendor/lib/handlebars-wrapper');
    require('vendor/lib/jquery-wrapper');

    OktaAuth = require('@okta/okta-auth-js/jquery');
    Util = require('util/Util');
    LoginRouter = require('LoginRouter');

    authClient = new OktaAuth({
      url: options.baseUrl,
      transformErrorXHR: Util.transformErrorXHR,
      headers: {
        'X-Okta-User-Agent-Extended': 'okta-signin-widget-' + WIDGET_VERSION
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

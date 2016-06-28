/*globals module */
/*jshint unused:false */

var OktaSignIn = (function () {

  var _ = require('underscore');

  // Remove once these are explicitly required in Courage
  require('vendor/lib/underscore-wrapper');
  require('vendor/lib/handlebars-wrapper');
  require('vendor/lib/jquery-wrapper');

  function getProperties(authClient, LoginRouter, config) {

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
      }
    };
  }

  function OktaSignIn(options) {
    var OktaAuth, Util, authClient, LoginRouter;

    // Labels are special - we need to pass them directly to the Bundles module
    // to easily extend our existing properties. Other widget options should be
    // passed through a normal function call (like LoginRouter below).
    if (options.labels) {
      // Populate cache
      require('i18n!nls/login');
      // Modify cache to include modifications
      var labelsCache = require.cache[require.resolve('i18n!nls/login')];
      _.extend(labelsCache.exports, options.labels);
      delete options.labels;
    }

    if (options.country) {
      require('i18n!nls/country');
      var countryCache = require.cache[require.resolve('i18n!nls/country')];
      _.extend(countryCache.exports, options.country);
      delete options.country;
    }

    OktaAuth = require('vendor/OktaAuth');
    Util = require('util/Util');
    LoginRouter = require('LoginRouter');


    authClient = new OktaAuth({
      url: options.baseUrl,
      transformErrorXHR: Util.transformErrorXHR,
      headers: {
        'X-Okta-SDK': 'okta-signin-widget-<%= widgetversion %>'
      },
      clientId: options.clientId,
      redirectUri: options.redirectUri
    });
    _.extend(this, LoginRouter.prototype.Events, getProperties(authClient, LoginRouter, options));

    // Triggers the event up the chain so it is available to the consumers of the widget.
    this.listenTo(LoginRouter.prototype, 'all', this.trigger);

  }

  return OktaSignIn;

})();

module.exports = OktaSignIn;

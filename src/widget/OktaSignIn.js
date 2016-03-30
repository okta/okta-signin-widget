/*global getRequireConfig */
/*jshint unused:false */

var OktaSignIn = (function () {

  var _ = require('underscore');

  function getProperties(authClient, config) {

    /**
     * Check if a session exists
     * @param callback - callback function invoked with 'true'/'false' as the argument.
     */
    function checkSession(callback) {
      authClient.existingSession().then(callback);
    }

    /**
     * Close the current session (sign-out). Callback is invoked with an error message
     * if the operation was not successful.
     * @param callback - function to invoke after closing the session.
     */
    function closeSession(callback) {
      authClient.closeSession().then(callback)
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
      authClient.refreshSession().then(callback);
    }

    /**
     * Refresh the idToken
     * @param idToken - idToken generated from the OAUTH call
     * @param callback - function to invoke after refreshing the idToken.
     *        The callback will be passed a new idToken if successful and
     *        an error message if not.
     */
    function refreshIdToken(idToken, callback) {
      authClient.refreshIdToken(idToken).then(callback)
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
      authClient.checkSession(function(res) {
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
      var LoginRouter = require('LoginRouter');
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
    var requireConfig = getRequireConfig(),
        OktaAuth, Util, authClient;

    // Labels are special - we need to pass them directly to the Bundles module
    // to easily extend our existing properties. Other widget options should be
    // passed through a normal function call (like LoginRouter below).
    if (options.labels || options.country) {
      requireConfig.config['util/Bundles'] = {labels: options.labels, country: options.country};
      delete options.labels;
      delete options.country;
    }

    require.config(requireConfig);
    OktaAuth = require('vendor/OktaAuth');
    Util = require('util/Util');

    authClient = new OktaAuth({ uri: options.baseUrl, transformErrorXHR: Util.transformErrorXHR });
    _.extend(this, getProperties(authClient, options));
  }

  return OktaSignIn;

})();

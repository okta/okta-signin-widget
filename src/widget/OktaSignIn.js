/*global getRequireConfig */
/*jshint unused:false */

function OktaSignIn(options) {
  var requireConfig = getRequireConfig(),
      OktaAuth, Util;

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

  this._ = require('underscore');
  this._.extend(this, {
    config: options,
    oktaAuth: new OktaAuth({ uri: options.baseUrl, transformErrorXHR: Util.transformErrorXHR })
  });
}

// This function is used to render to an element that exists on the page  -
// options must have an el or $el property.
OktaSignIn.prototype.renderEl = function (options, success, error) {
  var _ = this._,
      LoginRouter = require('LoginRouter');
  this.router = new LoginRouter(_.extend(this.config, options, {
    authClient: this.oktaAuth,
    globalSuccessFn: success,
    globalErrorFn: error
  }));
  this.router.start();
};

/**
 * Check if there is an active session. If there is one, the callback is invoked with
 * the session and user information (similar to calling the global success callback)
 * and if not, the callback is invoked with {status: 'INACTIVE'}, at which point,
 * the widget can be rendered using renderEl().
 * @param callback - function to invoke after checking if there is an active session.
 */
OktaSignIn.prototype.checkSession = function(callback) {
  var _ = this._,
      oktaAuth = this.oktaAuth;

  oktaAuth.checkSession(function(res) {
    if (res.status === 'ACTIVE' && res.user) {
      // only include the attributes that are passed into the successFn on primary auth.
      res.user = _.pick(res.user, 'id', 'profile', 'passwordChanged');
    }
    callback(res);
  });
};

/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define([
  'okta',
  './BaseLoginModel',
  'util/CookieUtil',
  'util/Enums'
],
function (Okta, BaseLoginModel, CookieUtil, Enums) {

  var _ = Okta._;

  return BaseLoginModel.extend({

    props: function () {
      var settingsUsername = this.settings && this.settings.get('username'),
          cookieUsername = CookieUtil.getCookieUsername(),
          remember = false,
          username;
      if (settingsUsername) {
        username = settingsUsername;
        remember = username === cookieUsername;
      }
      else if (cookieUsername) {
        username = cookieUsername;
        remember = true;
      }

      return {
        username: ['string', true, username],
        lastUsername: ['string', false, cookieUsername],
        password: ['string', true],
        context: ['object', false],
        remember: ['boolean', true, remember],
        multiOptionalFactorEnroll: ['boolean', true]
      };
    },

    local: {
      deviceFingerprint: ['string', false]
    },

    constructor: function (options) {
      this.settings = options && options.settings;
      this.appState = options && options.appState;
      Okta.Model.apply(this, arguments);
      this.listenTo(this, 'change:username', function (model, username) {
        this.set({remember: username === this.get('lastUsername')});
      });
    },
    parse: function (options) {
      return _.omit(options, ['settings', 'appState']);
    },

    save: function () {
      var username = this.settings.transformUsername(this.get('username'), Enums.PRIMARY_AUTH),
          password = this.get('password'),
          remember = this.get('remember'),
          lastUsername = this.get('lastUsername'),
          multiOptionalFactorEnroll = this.get('multiOptionalFactorEnroll'),
          deviceFingerprintEnabled = this.settings.get('features.deviceFingerprinting');

      // Only delete the cookie if its owner says so. This allows other
      // users to log in on a one-off basis.
      if (!remember && lastUsername === username) {
        CookieUtil.removeUsernameCookie();
      }
      else if (remember) {
        CookieUtil.setUsernameCookie(username);
      }

      //the 'save' event here is triggered and used in the BaseLoginController
      //to disable the primary button on the primary auth form
      this.trigger('save');

      this.appState.trigger('loading', true);

      var signInArgs = {
        username: username,
        password: password,
        options: {
          warnBeforePasswordExpired: true,
          multiOptionalFactorEnroll: multiOptionalFactorEnroll
        }
      };

      var primaryAuthPromise;
      if (this.appState.get('isUnauthenticatedStatus')) {
        primaryAuthPromise = this.doTransaction(function (transaction) {
          var authClient = this.appState.settings.authClient;
          return this.doPrimaryAuth(authClient, deviceFingerprintEnabled, signInArgs,
                                    transaction.authentication);
        });
      } else {
        primaryAuthPromise = this.startTransaction(function (authClient) {
          return this.doPrimaryAuth(authClient, deviceFingerprintEnabled, signInArgs,
                                    _.bind(authClient.signIn, authClient));
        });
      }

      return primaryAuthPromise
      .fail(_.bind(function () {
        this.trigger('error');
        // Specific event handled by the Header for the case where the security image is not
        // enabled and we want to show a spinner. (Triggered only here and handled only by Header).
        this.appState.trigger('removeLoading');
        CookieUtil.removeUsernameCookie();
      }, this))
      .fin(_.bind(function () {
        this.appState.trigger('loading', false);
      }, this));
    },

    doPrimaryAuth: function (authClient, deviceFingerprintEnabled, signInArgs, func) {
      // Add the custom header for fingerprint if needed, and then remove it afterwards
      // Since we only need to send it for primary auth
      if (deviceFingerprintEnabled) {
        authClient.options.headers['X-Device-Fingerprint'] = this.get('deviceFingerprint');
      }
      return func(signInArgs)
      .fin(function () {
        if (deviceFingerprintEnabled) {
          delete authClient.options.headers['X-Device-Fingerprint'];
        }
      });
    }
  });

});
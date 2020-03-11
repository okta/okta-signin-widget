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
      var cookieUsername = CookieUtil.getCookieUsername(),
          properties = this.getUsernameAndRemember(cookieUsername);

      var props = {
        username: {
          type: 'string',
          validate: function (value) {
            if(_.isEmpty(value)) {
              return Okta.loc('error.username.required', 'login');
            }
          },
          value: properties.username
        },
        lastUsername: ['string', false, cookieUsername],
        context: ['object', false],
        remember: ['boolean', true, properties.remember],
        multiOptionalFactorEnroll: ['boolean', true]
      };
      if (!(this.settings && this.settings.get('features.passwordlessAuth'))) {
        props.password = {
          type: 'string',
          validate: function (value) {
            if(_.isEmpty(value)) {
              return Okta.loc('error.password.required', 'login');
            }
          }
        };
      }
      return props;
    },

    getUsernameAndRemember: function (cookieUsername) {
      var settingsUsername = this.settings && this.settings.get('username'),
          rememberMeEnabled = this.settings && this.settings.get('features.rememberMe'),
          remember = false,
          username;

      if (settingsUsername) {
        username = settingsUsername;
        remember = rememberMeEnabled && username === cookieUsername;
      }
      else if (rememberMeEnabled && cookieUsername) {
        // Only respect the cookie if the feature is enabled.
        // Allows us to force prompting when necessary, e.g. SAML ForceAuthn
        username = cookieUsername;
        remember = true;
      }

      return {
        username: username,
        remember:remember
      };
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
          remember = this.get('remember'),
          lastUsername = this.get('lastUsername');

      this.setUsernameCookie(username, remember, lastUsername);

      //the 'save' event here is triggered and used in the BaseLoginController
      //to disable the primary button on the primary auth form
      this.trigger('save');

      this.appState.trigger('loading', true);

      var signInArgs = this.getSignInArgs(username);

      var primaryAuthPromise;

      if (this.appState.get('isUnauthenticated')) {
        var authClient = this.appState.settings.authClient;
        // bootstrapped with stateToken
        if (this.appState.get('isIdxStateToken')) {
          // if its an idx stateToken, we send the parameter as identifier to login API
          primaryAuthPromise = this.doTransaction(function (transaction) {
            return this.doPrimaryAuth(authClient, signInArgs, transaction.login);
          });
        } else {
          primaryAuthPromise = this.doTransaction(function (transaction) {
            return this.doPrimaryAuth(authClient, signInArgs, transaction.authenticate);
          });
        }
      } else {
        //normal username/password flow without stateToken
        primaryAuthPromise = this.startTransaction(function (authClient) {
          return this.doPrimaryAuth(authClient, signInArgs, _.bind(authClient.signIn, authClient));
        });
      }

      return primaryAuthPromise
        .fail(_.bind(function () {
          // Specific event handled by the Header for the case where the security image is not
          // enabled and we want to show a spinner. (Triggered only here and handled only by Header).
          this.appState.trigger('removeLoading');
          CookieUtil.removeUsernameCookie();
        }, this))
        .fin(_.bind(function () {
          this.appState.trigger('loading', false);
        }, this));
    },

    getSignInArgs: function (username) {
      var multiOptionalFactorEnroll = this.get('multiOptionalFactorEnroll');
      var signInArgs = {};

      if (!this.settings.get('features.passwordlessAuth')) {
        signInArgs.password = this.get('password');
      }

      // if its an idx stateToken, we send the parameter as identifier to login API
      if (this.appState.get('isIdxStateToken')) {
        signInArgs.identifier = username;
      } else {
        //only post options param for non-idx flows
        signInArgs.username  = username;
        signInArgs.options = {
          warnBeforePasswordExpired: true,
          multiOptionalFactorEnroll: multiOptionalFactorEnroll
        };
      }
      return signInArgs;
    },

    setUsernameCookie: function (username, remember, lastUsername) {
      // Do not modify the cookie when feature is disabled, relevant for SAML ForceAuthn prompts
      if (this.settings.get('features.rememberMe')) {
        // Only delete the cookie if its owner says so. This allows other
        // users to log in on a one-off basis.
        if (!remember && lastUsername === username) {
          CookieUtil.removeUsernameCookie();
        }
        else if (remember) {
          CookieUtil.setUsernameCookie(username);
        }
      }
    },

    doPrimaryAuth: function (authClient, signInArgs, func) {
      var deviceFingerprintEnabled = this.settings.get('features.deviceFingerprinting'),
          typingPatternEnabled = this.settings.get('features.trackTypingPattern');

      // Add the custom header for fingerprint, typing pattern if needed, and then remove it afterwards
      // Since we only need to send it for primary auth
      if (deviceFingerprintEnabled) {
        authClient.options.headers['X-Device-Fingerprint'] = this.appState.get('deviceFingerprint');
      }
      if (typingPatternEnabled) {
        authClient.options.headers['X-Typing-Pattern'] = this.appState.get('typingPattern');
      }
      var self = this;
      return func(signInArgs)
        .fin(function () {
          if (deviceFingerprintEnabled) {
            delete authClient.options.headers['X-Device-Fingerprint'];
            self.appState.unset('deviceFingerprint'); //Fingerprint can only be used once
          }
          if (typingPatternEnabled) {
            delete authClient.options.headers['X-Typing-Pattern'];
            self.appState.unset('typingPattern');
          }
        });
    }
  });

});

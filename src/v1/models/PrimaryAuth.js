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

import { _, loc, Model } from '@okta/courage';
import CookieUtil from 'util/CookieUtil';
import Enums from 'util/Enums';
import BaseLoginModel from './BaseLoginModel';

export default BaseLoginModel.extend({
  props: function() {
    const cookieUsername = CookieUtil.getCookieUsername();
    const properties = this.getUsernameAndRemember(cookieUsername);
    const props = {
      username: {
        type: 'string',
        validate: function(value) {
          if (_.isEmpty(value)) {
            return loc('error.username.required', 'login');
          }
        },
        value: properties.username,
      },
      lastUsername: ['string', false, cookieUsername],
      context: ['object', false],
      remember: ['boolean', true, properties.remember],
      multiOptionalFactorEnroll: ['boolean', true],
    };

    if (!(this.settings && this.settings.get('features.passwordlessAuth'))) {
      props.password = {
        type: 'string',
        validate: function(value) {
          if (_.isEmpty(value)) {
            return loc('error.password.required', 'login');
          }
        },
      };
    }
    return props;
  },

  getUsernameAndRemember: function(cookieUsername) {
    const settingsUsername = this.settings && this.settings.get('username');
    const rememberMeEnabled = this.settings && this.settings.get('features.rememberMe');
    let remember = false;
    let username;

    if (settingsUsername) {
      username = settingsUsername;
      remember = rememberMeEnabled && username === cookieUsername;
    } else if (rememberMeEnabled && cookieUsername) {
      // Only respect the cookie if the feature is enabled.
      // Allows us to force prompting when necessary, e.g. SAML ForceAuthn
      username = cookieUsername;
      remember = true;
    }

    return {
      username: username,
      remember: remember,
    };
  },

  constructor: function(options) {
    this.settings = options && options.settings;
    this.appState = options && options.appState;
    Model.apply(this, arguments);
    this.listenTo(this, 'change:username', function(model, username) {
      this.set({ remember: username === this.get('lastUsername') });
    });
  },
  parse: function(options) {
    return _.omit(options, ['settings', 'appState']);
  },

  save: function() {
    const username = this.settings.transformUsername(this.get('username'), Enums.PRIMARY_AUTH);
    const remember = this.get('remember');
    const lastUsername = this.get('lastUsername');

    this.setUsernameCookie(username, remember, lastUsername);

    //the 'save' event here is triggered and used in the BaseLoginController
    //to disable the primary button on the primary auth form
    this.trigger('save');

    this.appState.trigger('loading', true);

    const signInArgs = this.getSignInArgs(username);
    let primaryAuthPromise;

    if (this.appState.get('isUnauthenticated')) {
      const authClient = this.appState.settings.getAuthClient();

      // bootstrapped with stateToken
      if (this.appState.get('isIdxStateToken')) {
        // if its an idx stateToken, we send the parameter as identifier to login API
        primaryAuthPromise = this.doTransaction(function(transaction) {
          return this.doPrimaryAuth(authClient, signInArgs, transaction.login);
        });
      } else {
        primaryAuthPromise = this.doTransaction(function(transaction) {
          return this.doPrimaryAuth(authClient, signInArgs, transaction.authenticate);
        }, true);
      }
    } else {
      //normal username/password flow without stateToken
      primaryAuthPromise = this.startTransaction(function(authClient) {
        return this.doPrimaryAuth(authClient, signInArgs, _.bind(authClient.signInWithCredentials, authClient));
      });
    }

    return primaryAuthPromise
      .catch(() => {
        // Specific event handled by the Header for the case where the security image is not
        // enabled and we want to show a spinner. (Triggered only here and handled only by Header).
        this.appState.trigger('removeLoading');
        CookieUtil.removeUsernameCookie();
      })
      .finally(() => {
        this.appState.trigger('loading', false);
      });
  },

  getSignInArgs: function(username) {
    const multiOptionalFactorEnroll = this.get('multiOptionalFactorEnroll');
    const signInArgs = {};

    if (!this.settings.get('features.passwordlessAuth')) {
      signInArgs.password = this.get('password');
    }

    // if its an idx stateToken, we send the parameter as identifier to login API
    if (this.appState.get('isIdxStateToken')) {
      signInArgs.identifier = username;
    } else {
      //only post options param for non-idx flows
      signInArgs.username = username;
      signInArgs.options = {
        warnBeforePasswordExpired: true,
        multiOptionalFactorEnroll: multiOptionalFactorEnroll,
      };
    }
    return signInArgs;
  },

  setUsernameCookie: function(username, remember, lastUsername) {
    // Do not modify the cookie when feature is disabled, relevant for SAML ForceAuthn prompts
    if (this.settings.get('features.rememberMe')) {
      // Only delete the cookie if its owner says so. This allows other
      // users to log in on a one-off basis.
      if (!remember && lastUsername === username) {
        CookieUtil.removeUsernameCookie();
      } else if (remember) {
        CookieUtil.setUsernameCookie(username);
      }
    }
  },

  doPrimaryAuth: function(authClient, signInArgs, func) {
    const deviceFingerprintEnabled = this.settings.get('features.deviceFingerprinting');
    const typingPatternEnabled = this.settings.get('features.trackTypingPattern');

    // Add the custom header for fingerprint, typing pattern if needed, and then remove it afterwards
    // Since we only need to send it for primary auth
    if (deviceFingerprintEnabled && this.appState.get('deviceFingerprint')) {
      authClient.http.setRequestHeader('X-Device-Fingerprint', this.appState.get('deviceFingerprint'));
    }
    if (typingPatternEnabled && this.appState.get('typingPattern')) {
      authClient.http.setRequestHeader('X-Typing-Pattern', this.appState.get('typingPattern'));
    }

    const self = this;

    return func(signInArgs).finally(function() {
      if (deviceFingerprintEnabled) {
        authClient.http.setRequestHeader('X-Device-Fingerprint', undefined);
        self.appState.unset('deviceFingerprint'); //Fingerprint can only be used once
      }
      if (typingPatternEnabled) {
        authClient.http.setRequestHeader('X-Typing-Pattern', undefined);
        self.appState.unset('typingPattern');
      }
    });
  },
});

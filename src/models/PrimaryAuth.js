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
  'vendor/plugins/jquery.cookie'
],
function (Okta, BaseLoginModel) {

  var $ = Okta.$;
  var _ = Okta._;
  var LAST_USERNAME_COOKIE_NAME = 'ln';
  var DAYS_SAVE_REMEMBER = 365;

  return BaseLoginModel.extend({

    props: function () {
      var settingsUsername = this.settings && this.settings.get('username'),
          cookieUsername = $.cookie(LAST_USERNAME_COOKIE_NAME),
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
      var username = this.get('username'),
          password = this.get('password'),
          remember = this.get('remember'),
          lastUsername = this.get('lastUsername'),
          multiOptionalFactorEnroll = this.get('multiOptionalFactorEnroll');

      // Only delete the cookie if its owner says so. This allows other
      // users to log in on a one-off basis.
      if (!remember && lastUsername === username) {
        $.removeCookie(LAST_USERNAME_COOKIE_NAME, { path: '/' });
      }
      else if (remember) {
        $.cookie(LAST_USERNAME_COOKIE_NAME, username, {
          expires: DAYS_SAVE_REMEMBER,
          path: '/'
        });
      }

      //the 'save' event here is triggered and used in the BaseLoginController
      //to disable the primary button on the primary auth form
      this.trigger('save');

      return this.startTransaction(function (authClient) {
        return authClient.primaryAuth({
          username: username,
          password: password,
          options: {
            warnBeforePasswordExpired: true,
            multiOptionalFactorEnroll: multiOptionalFactorEnroll
          }
        });
      })
      .then(_.bind(function () {
        // Transition from the loading state on beacon on success response
        this.appState.trigger('loading', false);
      }, this))
      .fail(_.bind(function () {
        this.trigger('error');
        $.removeCookie(LAST_USERNAME_COOKIE_NAME, { path: '/' });
      }, this));
    }
  });

});
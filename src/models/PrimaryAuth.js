/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
      .fail(_.bind(function () {
        this.trigger('error');
        $.removeCookie(LAST_USERNAME_COOKIE_NAME, { path: '/' });
      }, this));
    }
  });

});
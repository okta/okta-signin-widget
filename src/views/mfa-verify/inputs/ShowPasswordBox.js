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
  'views/shared/TextBox'
],
function (Okta, TextBox) {

  return TextBox.extend({
    template: Okta.tpl('\
      <input type="password" placeholder="{{placeholder}}" name="{{name}}" id="{{inputId}}" value="{{value}}"/>\
      <span class="password-toggle">\
        <span class="button button-dark button-show">\
          {{i18n code="mfa.challenge.answer.showAnswer" bundle="login"}}</span>\
        <span class="button button-hide">{{i18n code="mfa.challenge.answer.hideAnswer" bundle="login"}}</span>\
      </span>'),

    initialize: function () {
      this.events['click .password-toggle .button-show'] = '_showPassword';
      this.events['click .password-toggle .button-hide'] = '_hidePassword';

      this.delegateEvents();
    },

    changeType: function (type) {
      TextBox.prototype.changeType.apply(this, arguments);
      this.$('.password-toggle').toggleClass('password-toggle-on', type !== 'password');
    },

    _showPassword: function () {
      this.changeType('text');
    },

    _hidePassword: function () {
      this.changeType('password');
    }

  });

});

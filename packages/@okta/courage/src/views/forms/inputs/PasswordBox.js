/*!
 * Copyright (c) 2015-2018, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'okta/underscore',
  'shared/util/TemplateUtil',
  './TextBox'
],
function (_, TemplateUtil, TextBox) {

  var toggleTemplate = TemplateUtil.tpl('\
      <span class="password-toggle">\
        <span class="eyeicon visibility-16 button-show"></span>\
        <span class="eyeicon visibility-off-16 button-hide"></span>\
      </span>\
  ');

  var toggleTimeout = 30000;

  return TextBox.extend({
    initialize: function () {
      if (this.__showPasswordToggle()) {
        this.events['click .password-toggle .button-show'] = '__showPassword';
        this.events['click .password-toggle .button-hide'] = '__hidePassword';
      }
      this.delegateEvents();
    },

    postRender: function () {
      if (this.isEditMode() && this.__showPasswordToggle()) {
        this.$el.append(toggleTemplate);
        this.$el.find('input[type="password"]').addClass('password-with-toggle');
      }
      TextBox.prototype.postRender.apply(this, arguments);
    },

    __showPasswordToggle: function () {
      return (this.options.params && this.options.params.showPasswordToggle);
    },

    __showPassword: function () {
      TextBox.prototype.changeType.apply(this, ['text']);
      this.$('.password-toggle .button-show').hide();
      this.$('.password-toggle .button-hide').show();
      this.passwordToggleTimer = _.delay(() => {
        this.__hidePassword();
      }, toggleTimeout);
    },

    __hidePassword: function () {
      TextBox.prototype.changeType.apply(this, ['password']);
      this.$('.password-toggle .button-show').show();
      this.$('.password-toggle .button-hide').hide();
      // clear timeout
      if (this.passwordToggleTimer) {
        clearTimeout(this.passwordToggleTimer);
      }
    }
  });
});

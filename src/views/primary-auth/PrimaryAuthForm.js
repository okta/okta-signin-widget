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
  'views/shared/TextBox',
  'util/DeviceFingerprint'
], function (Okta, TextBox, DeviceFingerprint) {

  var _ = Okta._;

  return Okta.Form.extend({
    className: 'primary-auth-form',
    noCancelButton: true,
    save: function () {
      if (this.settings.get('features.passwordlessAuth')) {
        return Okta.loc('oform.next', 'login') ;
      }
      return Okta.loc('primaryauth.submit', 'login');
    },
    saveId: 'okta-signin-submit',
    layout: 'o-form-theme',

    // If socialAuth is configured, the title moves from the form to
    // the top of the container (and is rendered in socialAuth).
    title: function () {
      var formTitle = Okta.loc('primaryauth.title', 'login');
      if (this.settings.get('socialAuthPositionTop')) {
        formTitle = '';
      }
      return formTitle;
    },

    initialize: function () {
      this.listenTo(this, 'save', function () {
        var self = this;
        var creds = {
          username: this.model.get('username')
        };
        if (!this.settings.get('features.passwordlessAuth')) {
          creds.password = this.model.get('password');
        }
        this.settings.processCreds(creds)
        .then(function() {
          if (!self.settings.get('features.deviceFingerprinting')) {
            return;
          }
          return DeviceFingerprint.generateDeviceFingerprint(self.settings.get('baseUrl'), self.$el)
          .then(function (fingerprint) {
            self.options.appState.set('deviceFingerprint', fingerprint);
          })
          .fail(function () {
            // Keep going even if device fingerprint fails
          });
        })
        .then(_.bind(this.model.save, this.model));
      });

      this.stateEnableChange();
    },

    stateEnableChange: function() {
      this.listenTo(this.state, 'change:enabled', function (model, enable) {
        if (enable) {
          this.enable();
        }
        else {
          this.disable();
        }
      });
    },

    inputs: function () {
      var inputs = [];
      inputs.push(this.getUsernameField());
      if (!this.settings.get('features.passwordlessAuth')) {
        inputs.push(this.getPasswordField());
      }
      if (this.settings.get('features.rememberMe')) {
        inputs.push(this.getRemeberMeCheckbox());
      }
      return inputs;
    },

    getUsernameField: function() {
      var userNameFieldObject = {
        label: false,
        'label-top': true,
        placeholder: Okta.loc('primaryauth.username.placeholder', 'login'),
        name: 'username',
        input: TextBox,
        inputId: 'okta-signin-username',
        type: 'text',
        disabled: this.options.appState.get('disableUsername'),
        params: {
          innerTooltip: {
            title: Okta.loc('primaryauth.username.placeholder', 'login'),
            text: Okta.loc('primaryauth.username.tooltip', 'login')
          },
          icon: 'person-16-gray'
        }
      };

      if (this.settings.get('features.showPasswordToggleOnSignInPage')) {
        userNameFieldObject.params.iconDivider = true;
      }
      return userNameFieldObject;
    },

    getPasswordField: function() {
      var passwordFieldObject = {
        label: false,
        'label-top': true,
        placeholder: Okta.loc('primaryauth.password.placeholder', 'login'),
        name: 'password',
        inputId: 'okta-signin-password',
        validateOnlyIfDirty: true,
        type: 'password',
        params: {
          innerTooltip: {
            title: Okta.loc('primaryauth.password.placeholder', 'login'),
            text: Okta.loc('primaryauth.password.tooltip', 'login')
          },
          icon: 'remote-lock-16'
        }
      };
      if (this.settings.get('features.showPasswordToggleOnSignInPage')) {
        passwordFieldObject.params.iconDivider = true;
        passwordFieldObject.params.showPasswordToggle = true;
      }
      return passwordFieldObject;
    },

    getRemeberMeCheckbox: function() {
      return {
        label: false,
        placeholder: Okta.loc('remember', 'login'),
        name: 'remember',
        type: 'checkbox',
        'label-top': true,
        className: 'margin-btm-0',
        initialize: function () {
          this.listenTo(this.model, 'change:remember', function (model, val) {
            // OKTA-98946: We normally re-render on changes to model values,
            // but in this case we will manually update the checkbox due to
            // iOS Safari and how it handles autofill - it will autofill the
            // form anytime the dom elements are re-rendered, which prevents
            // the user from editing their username.
            this.$(':checkbox').prop('checked', val).trigger('updateState');
          });
        }
      };
    },

    focus: function () {
      if (!this.model.get('username')) {
        this.getInputs().first().focus();
      } else if (!this.settings.get('features.passwordlessAuth')) {
        this.getInputs().toArray()[1].focus();
      }
    }

  });

});

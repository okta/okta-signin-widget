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
    save: _.partial(Okta.loc, 'primaryauth.submit', 'login'),
    layout: 'o-form-theme',

    // If socialAuth is configured, the title moves from the form to
    // the top of the container (and is rendered in socialAuth).
    title: function () {
      var formTitle = Okta.loc('primaryauth.title', 'login');
      if (this.settings.get('socialAuthConfigured') &&
          this.settings.get('socialAuthPositionTop')) {
        formTitle = '';
      }
      return formTitle;
    },

    initialize: function () {
      this.listenTo(this, 'save', function () {
        var self = this;
        var saveActions = function() {
          if (self.settings.get('features.deviceFingerprinting')) {
            DeviceFingerprint.generateDeviceFingerprint(self.settings.get('baseUrl'), self.$el)
              .then(function (fingerprint) {
                self.model.set('deviceFingerprint', fingerprint);
              })
              .fail(function () {
                // Keep going even if device fingerprint fails
              })
              .fin(function () {
                self.model.save();
              });
          } else {
            self.model.save();
          }
        };
        var processCreds = this.settings.get('processCreds');
        if (!_.isFunction(processCreds)) {
          saveActions();
        } else {
          var creds = {
            username: this.model.get('username'),
            password: this.model.get('password')
          };
          if (processCreds.length === 2) {
            processCreds(creds, saveActions);
          } else {
            processCreds(creds);
            saveActions();
          }
        }
      });
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
      var inputs = [
        {
          label: false,
          'label-top': true,
          placeholder: Okta.loc('primaryauth.username.placeholder', 'login'),
          name: 'username',
          input: TextBox,
          type: 'text',
          params: {
            innerTooltip: {
              title: Okta.loc('primaryauth.username.placeholder', 'login'),
              text: Okta.loc('primaryauth.username.tooltip', 'login')
            },
            icon: 'person-16-gray'
          }
        },
        {
          label: false,
          'label-top': true,
          placeholder: Okta.loc('primaryauth.password.placeholder', 'login'),
          name: 'password',
          input: TextBox,
          type: 'password',
          params: {
            innerTooltip: {
              title: Okta.loc('primaryauth.password.placeholder', 'login'),
              text: Okta.loc('primaryauth.password.tooltip', 'login')
            },
            icon: 'remote-lock-16'
          }
        }
      ];
      if (this.settings.get('features.rememberMe')) {
        inputs.push({
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
        });
      }

      return inputs;
    },

    focus: function () {
      if (!this.model.get('username')) {
        this.getInputs().first().focus();
      } else {
        this.getInputs().toArray()[1].focus();
      }
    }

  });

});

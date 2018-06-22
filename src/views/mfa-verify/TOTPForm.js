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

define(['okta', 'views/shared/TextBox'], function (Okta, TextBox) {

  var _ = Okta._;

  return Okta.Form.extend({
    className: 'mfa-verify-totp',
    autoSave: true,
    noCancelButton: true,
    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-totp' },

    initialize: function () {
      var factorName = this.model.get('factorLabel');
      var maskPasswordField = this.model.get('provider') === 'RSA' || this.model.get('provider') === 'DEL_OATH';

      this.title = factorName;
      this.subtitle = Okta.loc('mfa.challenge.title', 'login', [factorName]);

      this.addInput({
        label: false,
        'label-top': true,
        placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
        className: 'o-form-fieldset o-form-label-top auth-passcode',
        name: 'answer',
        input: TextBox,
        type: maskPasswordField ? 'password' : 'tel'
      });

      if (this.options.appState.get('allowRememberDevice')) {
        this.addInput({
          label: false,
          'label-top': true,
          placeholder: this.options.appState.get('rememberDeviceLabel'),
          className: 'margin-btm-0',
          name: 'rememberDevice',
          type: 'checkbox'
        });
      }

      if (this.model.get('provider') === 'RSA' || this.model.get('provider') === 'DEL_OATH') {
        this.listenTo(this.model, 'error', _.bind(function (source, error) {
          if (error && error.status === 409) {
            // 409 means we are in change pin, so we should clear out answer input
            this.$('.auth-passcode input').val('');
            this.$('.auth-passcode input').trigger('change');
            this.$('.auth-passcode input').focus();
          }
        }, this));
      }
    }

  });

});

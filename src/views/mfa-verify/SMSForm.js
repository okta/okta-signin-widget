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

define(['okta', 'vendor/lib/q'], function (Okta, Q) {

  var subtitleTpl = Okta.Handlebars.compile('({{phoneNumber}})');
  var _ = Okta._;
  var API_RATE_LIMIT = 30000; //milliseconds

  return Okta.Form.extend({
    className: 'mfa-verify-sms',
    autoSave: true,
    noCancelButton: true,
    save: Okta.loc('mfa.challenge.verify', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-sms' },

    disableSubmitButton: function () {
      return this.model.appState.get('isMfaChallenge');
    },

    initialize: function () {
      var self = this;
      this.title = this.model.get('factorLabel');
      this.subtitle = subtitleTpl({
        phoneNumber: this.model.get('phoneNumber')
      });
      this.listenTo(this.model, 'error', function () {
        this.clearErrors();
      });
      this.add(Okta.createButton({
        attributes: { 'data-se': 'sms-send-code' },
        className: 'button sms-request-button',
        title: Okta.loc('mfa.sendCode', 'login'),
        click: function () {
          self.clearErrors();
          // To send an OTP to the device, make the same request but use
          // an empty passCode
          this.model.set('answer', '');
          this.model.save()
          .then(_.bind(function () {
            this.options.title = Okta.loc('mfa.sent', 'login');
            this.disable();
            this.render();
            // render and focus on the passcode input field.
            self.getInputs().first().render().focus();
            return Q.delay(API_RATE_LIMIT);
          }, this))
          .then(_.bind(function () {
            this.options.title = Okta.loc('mfa.resendCode', 'login');
            this.enable();
            this.render();
          }, this));
        }
      }));
      this.addInput({
        label: false,
        'label-top': true,
        placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
        className: 'o-form-fieldset o-form-label-top auth-passcode',
        name: 'answer',
        type: 'text'
      });
    }

  });

});

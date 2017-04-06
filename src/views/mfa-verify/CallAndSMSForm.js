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
/* eslint complexity: [2, 7] */
define(['okta', 'vendor/lib/q', 'views/shared/TextBox'], function (Okta, Q, TextBox) {

  var subtitleTpl = Okta.Handlebars.compile('({{phoneNumber}})');
  var _ = Okta._;
  var API_RATE_LIMIT = 30000; //milliseconds

  function isCallFactor(factorType) {
    return factorType === 'call';
  }

  return Okta.Form.extend({
    className: 'mfa-verify-sms-call',
    autoSave: true,
    noCancelButton: true,
    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',

    disableSubmitButton: function () {
      return this.model.appState.get('isMfaChallenge');
    },

    initialize: function () {
      var self = this;
      this.title = this.model.get('factorLabel');

      var factorType = this.model.get('factorType');
      var isCall = isCallFactor(factorType);
      this.$el.attr('data-se', 'factor-' + factorType);
      var buttonDataSe = isCall ? 'make-call' : 'sms-send-code';
      var buttonClassName = isCall ? 'call-request-button' : 'sms-request-button';

      var formSubmit = Okta.loc(isCall ? 'mfa.call' : 'mfa.sendCode', 'login');
      var formRetry = Okta.loc(isCall ? 'mfa.redial' : 'mfa.resendCode', 'login');
      var formSubmitted = Okta.loc(isCall ? 'mfa.calling' : 'mfa.sent', 'login');

      this.subtitle = subtitleTpl({
        phoneNumber: this.model.get('phoneNumber')
      });
      this.listenTo(this.model, 'error', function () {
        this.clearErrors();
      });
      this.add(Okta.createButton({
        attributes: { 'data-se': buttonDataSe },
        className: 'button ' + buttonClassName,
        title: formSubmit,
        click: function () {
          self.clearErrors();
          // To send an OTP to the device, make the same request but use
          // an empty passCode
          this.model.set('answer', '');
          this.model.save()
          .then(_.bind(function () {
            this.options.title = formSubmitted;
            this.disable();
            this.render();
            // render and focus on the passcode input field.
            self.getInputs().first().render().focus();
            return Q.delay(API_RATE_LIMIT);
          }, this))
          .then(_.bind(function () {
            this.options.title = formRetry;
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
        input: TextBox,
        type: 'text'
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
    }

  });

});

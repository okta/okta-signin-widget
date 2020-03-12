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

import hbs from 'handlebars-inline-precompile';

/* eslint complexity: [2, 7] */
define([
  'okta',
  'q',
  'views/shared/TextBox',
  'util/Enums'
], function (Okta, Q, TextBox, Enums) {

  var subtitleTpl = hbs('({{subtitle}})');
  var _ = Okta._;
  var warningTemplate = Okta.View.extend({
    template: hbs('<div class="okta-form-infobox-warning infobox infobox-warning login-timeout-warning">\
                           <span class="icon warning-16"></span>\
                           <p>{{{warning}}}</p>\
                         </div>\
                         ')
  });

  function getFormAndButtonDetails (factorType) {
    switch(factorType) {
    case 'sms':
      return {
        buttonDataSe: 'sms-send-code',
        buttonClassName: 'sms-request-button',
        formSubmit: Okta.loc('mfa.sendCode', 'login'),
        formRetry: Okta.loc('mfa.resendCode', 'login'),
        formSubmitted: Okta.loc('mfa.sent', 'login'),
        subtitle: subtitleTpl({ subtitle: this.model.get('phoneNumber') }),
        warning: Okta.loc('factor.sms.time.warning', 'login'),
      };
    case 'call':
      return {
        buttonDataSe: 'make-call',
        buttonClassName: 'call-request-button',
        formSubmit: Okta.loc('mfa.call', 'login'),
        formRetry: Okta.loc('mfa.redial', 'login'),
        formSubmitted: Okta.loc('mfa.calling', 'login'),
        subtitle: subtitleTpl({ subtitle: this.model.get('phoneNumber') }),
        warning: Okta.loc('factor.call.time.warning', 'login'),
      };
    case 'email':
      return {
        buttonDataSe: 'email-send-code',
        buttonClassName: 'email-request-button',
        formSubmit: Okta.loc('mfa.sendEmail', 'login'),
        formRetry: Okta.loc('mfa.resendEmail', 'login'),
        formSubmitted: Okta.loc('mfa.sent', 'login'),
        subtitle: subtitleTpl({ subtitle: this.model.get('email') }),
      };
    default:
      return {
        buttonDataSe: '',
        buttonClassName: '',
        formSubmit: '',
        formRetry: '',
        formSubmitted: '',
      };
    }
  }

  return Okta.Form.extend({
    className: 'mfa-verify-passcode',
    autoSave: true,
    noCancelButton: true,
    save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',

    disableSubmitButton: function () {
      return this.model.appState.get('isMfaChallenge') && this.model.get('answer');
    },

    showWarning: function (msg) {
      this.clearWarnings();
      this.add(warningTemplate, '.o-form-error-container', {options: {warning: msg}});
    },
    clearWarnings: function () {
      this.$('.okta-form-infobox-warning').remove();
    },

    initialize: function () {
      var form = this;
      this.title = this.model.get('factorLabel');

      var factorType = this.model.get('factorType');
      var formAndButtonDetails = getFormAndButtonDetails.call(this, factorType);
      var warningDetails = formAndButtonDetails.warning;
      this.$el.attr('data-se', 'factor-' + factorType);

      this.subtitle = formAndButtonDetails.subtitle;
      this.listenTo(this.model, 'error', function () {
        this.clearErrors();
      });
      this.addInput({
        label: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
        'label-top': true,
        className: 'o-form-fieldset o-form-label-top auth-passcode',
        name: 'answer',
        input: TextBox,
        type: 'tel'
      });
      this.add(Okta.createButton({
        attributes: { 'data-se': formAndButtonDetails.buttonDataSe },
        className: 'button ' + formAndButtonDetails.buttonClassName,
        title: formAndButtonDetails.formSubmit,
        click: function () {
          form.clearErrors();
          this.disable();
          form.clearWarnings();
          this.options.title = formAndButtonDetails.formSubmitted;
          this.render();
          // To send an OTP to the device, make the same request but use
          // an empty passCode
          this.model.set('answer', '');
          this.model.save()
            .then(function () {
            // render and focus on the passcode input field.
              form.getInputs().first().render().focus();
              return Q.delay(Enums.API_RATE_LIMIT);
            })
            .then(_.bind(function () {
              this.options.title = formAndButtonDetails.formRetry;
              this.enable();
              if (factorType === 'call' || factorType === 'sms') {
                form.showWarning(warningDetails);
              }
              this.render();
            }, this));
        }
      }));
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

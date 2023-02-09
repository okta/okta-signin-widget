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
import { _, loc, Form, createButton, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Q from 'q';
import Enums from 'util/Enums';
import TextBox from 'v1/views/shared/TextBox';
const subtitleTpl = hbs('({{subtitle}})');
const PassCodeFormwarningTemplate = View.extend({
  className: 'okta-form-infobox-warning infobox infobox-warning login-timeout-warning',
  attributes: {
    'aria-live': 'polite',
  },
  template: hbs`
      <span class="icon warning-16"></span>
      <p>{{{warning}}}</p>
    `,
});

function getFormAndButtonDetails(factorType) {
  switch (factorType) {
  case 'sms':
    return {
      buttonDataSe: 'sms-send-code',
      buttonClassName: 'sms-request-button',
      formSubmit: loc('mfa.sendCode', 'login'),
      formRetry: loc('mfa.resendCode', 'login'),
      formSubmitted: loc('mfa.sent', 'login'),
      subtitle: subtitleTpl({ subtitle: this.model.get('phoneNumber') }),
      warning: hbs`{{i18n
        code="factor.sms.time.warning"
        bundle="login"
        $1="<b>$1</b>"
      }}`,
    };
  case 'call':
    return {
      buttonDataSe: 'make-call',
      buttonClassName: 'call-request-button',
      formSubmit: loc('mfa.call', 'login'),
      formRetry: loc('mfa.redial', 'login'),
      formSubmitted: loc('mfa.calling', 'login'),
      subtitle: subtitleTpl({ subtitle: this.model.get('phoneNumber') }),
      warning: hbs`{{i18n
        code="factor.call.time.warning"
        bundle="login"
        $1="<b>$1</b>"
      }}`,
    };
  case 'email':
    return {
      buttonDataSe: 'email-send-code',
      buttonClassName: 'email-request-button',
      formSubmit: loc('mfa.sendEmail', 'login'),
      formRetry: loc('mfa.resendEmail', 'login'),
      formSubmitted: loc('mfa.sent', 'login'),
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

export default Form.extend({
  className: 'mfa-verify-passcode',
  autoSave: true,
  noCancelButton: true,
  save: _.partial(loc, 'mfa.challenge.verify', 'login'),
  scrollOnError: false,
  layout: 'o-form-theme',

  disableSubmitButton: function() {
    return this.model.appState.get('isMfaChallenge') && this.model.get('answer');
  },

  showWarning: function(msg) {
    this.clearWarnings();
    this.add(PassCodeFormwarningTemplate, '.o-form-error-container', { options: { warning: msg } });
  },
  clearWarnings: function() {
    this.$('.okta-form-infobox-warning').remove();
  },

  initialize: function() {
    const form = this;

    this.title = this.model.get('factorLabel');

    const factorType = this.model.get('factorType');
    const formAndButtonDetails = getFormAndButtonDetails.call(this, factorType);
    const warningDetails = formAndButtonDetails.warning;

    this.$el.attr('data-se', 'factor-' + factorType);

    this.subtitle = formAndButtonDetails.subtitle;
    this.listenTo(this.model, 'error', function() {
      this.clearErrors();
    });
    this.addInput({
      label: loc('mfa.challenge.enterCode.placeholder', 'login'),
      'label-top': true,
      className: 'o-form-fieldset o-form-label-top auth-passcode',
      name: 'answer',
      input: TextBox,
      type: 'tel',
    });
    this.add(
      createButton({
        attributes: { 'data-se': formAndButtonDetails.buttonDataSe },
        className: 'button ' + formAndButtonDetails.buttonClassName,
        title: formAndButtonDetails.formSubmit,
        click: function() {
          form.clearErrors();
          this.disable();
          form.clearWarnings();
          this.options.title = formAndButtonDetails.formSubmitted;
          this.render();
          // To send an OTP to the device, make the same request but use
          // an empty passCode
          this.model.set('answer', '');
          this.model
            .save()
            .then(function() {
              // render and focus on the passcode input field.
              form.getInputs().first().render().focus();
              return Q.delay(Enums.API_RATE_LIMIT);
            })
            .then(() => {
              this.options.title = formAndButtonDetails.formRetry;
              this.enable();
              if (factorType === 'call' || factorType === 'sms') {
                form.showWarning(warningDetails);
              }
              this.render();
            });
        },
      })
    );
    if (this.options.appState.get('allowRememberDevice')) {
      this.addInput({
        label: false,
        'label-top': true,
        placeholder: this.options.appState.get('rememberDeviceLabel'),
        className: 'margin-btm-0',
        name: 'rememberDevice',
        type: 'checkbox',
      });
    }
  },
});

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

/* eslint complexity: [2, 8] */
import { _, loc, internal, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import CountryUtil from 'util/CountryUtil';
import Enums from 'util/Enums';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import Util from 'util/Util';
import Footer from 'v1/views/enroll-factors/Footer';
import PhoneTextBox from 'v1/views/enroll-factors/PhoneTextBox';
import TextBox from 'v1/views/shared/TextBox';
let { Keys } = internal.util;
const EnrollCallAndSmsControllerwarningTemplate = View.extend({
  className: 'okta-form-infobox-warning infobox infobox-warning login-timeout-warning',
  attributes: {
    'aria-live': 'polite',
  },
  template: hbs`
      <span class="icon warning-16"></span>
      <p>{{{warning}}}</p>
    `,
});
const factorIdIsDefined = {
  factorId: function(val) {
    return !_.isUndefined(val);
  },
};

function isCallFactor(factorType) {
  return factorType === 'call';
}

function getClassName(factorType) {
  return isCallFactor(factorType) ? 'enroll-call' : 'enroll-sms';
}

function sendCode(e) {
  if (Keys.isEnter(e)) {
    e.stopPropagation();
    e.preventDefault();
    if (e.type === 'keyup' && e.data && e.data.model) {
      e.data.model.sendCode();
    }
  }
}

export default FormController.extend({
  className: function() {
    return getClassName(this.options.factorType);
  },
  Model: function() {
    return {
      props: {
        phoneNumber: ['string', true],
        phoneExtension: ['string', false],
        lastEnrolledPhoneNumber: 'string',
        passCode: ['string', true],
        factorId: 'string',
      },
      local: {
        countryCode: ['string', false, this.options.appState.get('userCountryCode')],
        hasExistingPhones: 'boolean',
        trapEnrollment: 'boolean',
        ableToResend: 'boolean',
        factorType: 'string',
        skipPhoneValidation: 'boolean',
      },
      derived: {
        countryCallingCode: {
          deps: ['countryCode'],
          fn: function(countryCode) {
            return '+' + CountryUtil.getCallingCodeForCountry(countryCode);
          },
        },
        fullPhoneNumber: {
          deps: ['countryCallingCode', 'phoneNumber'],
          fn: function(countryCallingCode, phoneNumber) {
            return phoneNumber ? countryCallingCode + phoneNumber : '';
          },
        },
        enrolled: {
          deps: ['lastEnrolledPhoneNumber', 'fullPhoneNumber'],
          fn: function(lastEnrolled, current) {
            return lastEnrolled === current;
          },
        },
      },
      limitResending: function() {
        this.set({ ableToResend: false });
        _.delay(_.bind(this.set, this), Enums.API_RATE_LIMIT, { ableToResend: true });
      },
      sendCode: function() {
        const self = this;
        const phoneNumber = this.get('fullPhoneNumber');
        const phoneExtension = this.get('phoneExtension');
  
        self.trigger('errors:clear');
  
        if (!phoneNumber.length) {
          self.trigger('invalid', self, { phoneNumber: 'model.validation.field.blank' });
          return;
        }
  
        return this.doTransaction(function(transaction) {
          const isMfaEnroll = transaction.status === 'MFA_ENROLL' || transaction.status === 'FACTOR_ENROLL';
          const profileData = {
            phoneNumber: phoneNumber,
            updatePhone: isMfaEnroll ? self.get('hasExistingPhones') : true,
          };
  
          if (isCallFactor(self.get('factorType'))) {
            profileData['phoneExtension'] = phoneExtension;
          }
  
          if (self.get('skipPhoneValidation')) {
            profileData['validatePhone'] = false;
          }
  
          const doEnroll = function(trans) {
            const factor = _.findWhere(trans.factors, {
              factorType: self.get('factorType'),
              provider: 'OKTA',
            });
  
            return factor
              .enroll({
                profile: profileData,
              })
              .catch(function(error) {
                if (error.errorCode === 'E0000098') {
                  // E0000098: "This phone number is invalid."
                  self.set('skipPhoneValidation', true);
                  error.xhr.responseJSON.errorSummary = loc('enroll.sms.try_again', 'login');
                }
                throw error;
              });
          };
  
          if (isMfaEnroll) {
            return doEnroll(transaction);
          } else {
            // We must transition to MfaEnroll before updating the phone number
            self.set('trapEnrollment', true);
            return transaction.prev().then(doEnroll).then(function(trans) {
              self.set('trapEnrollment', false);
              return trans;
            });
          }
          // Rethrow errors so we can change state
          // AFTER setting the new transaction
        }, true)
          .then(function() {
            self.set('lastEnrolledPhoneNumber', phoneNumber);
            self.limitResending();
          })
          .catch(function() {
            self.set('trapEnrollment', false);
          });
      },
      resendCode: function() {
        this.trigger('errors:clear');
        this.limitResending();
        return this.doTransaction(function(transaction) {
          return transaction.resend(this.get('factorType'));
        });
      },
      save: function() {
        return this.doTransaction(function(transaction) {
          return transaction.activate({
            passCode: this.get('passCode'),
          });
        });
      },
    };
  },
  Form: function() {
    const factorType = this.options.factorType;
    const isCall = isCallFactor(factorType);
    const formTitle = loc(isCall ? 'enroll.call.setup' : 'enroll.sms.setup', 'login');
    const formSubmit = loc(isCall ? 'mfa.call' : 'mfa.sendCode', 'login');
    const formRetry = loc(isCall ? 'mfa.redial' : 'mfa.resendCode', 'login');
    const formSubmitted = loc(isCall ? 'mfa.calling' : 'mfa.sent', 'login');
    const numberFieldClassName = isCall ? 'enroll-call-phone' : 'enroll-sms-phone';
    const buttonClassName = isCall ? 'call-request-button' : 'sms-request-button';
    const formChildren = [
      FormType.Input({
        name: 'countryCode',
        type: 'select',
        wide: true,
        options: CountryUtil.getCountries(),
      }),
      FormType.Input({
        label: loc('mfa.phoneNumber.placeholder', 'login'),
        'label-top': true,
        className: numberFieldClassName,
        name: 'phoneNumber',
        input: PhoneTextBox,
        type: 'text',
        render: function() {
          this.$('input[name="phoneNumber"]')
            .off('keydown keyup', sendCode)
            .keydown(sendCode)
            .keyup({ model: this.model }, sendCode);
        },
      }),
    ];

    if (isCall) {
      formChildren.push(
        FormType.Input({
          label: loc('mfa.phoneNumber.ext.placeholder', 'login'),
          'label-top': true,
          className: 'enroll-call-extension',
          name: 'phoneExtension',
          input: TextBox,
          type: 'text',
        })
      );
    }
    formChildren.push(
      FormType.Button({
        title: formSubmit,
        attributes: { 'data-se': buttonClassName },
        className: 'button button-primary js-enroll-phone margin-top-30 ' + buttonClassName,
        click: function() {
          this.model.sendCode();
        },
      }),
      FormType.Button({
        title: formRetry,
        attributes: { 'data-se': buttonClassName },
        className: 'button js-enroll-phone margin-top-30 ' + buttonClassName,
        click: function() {
          this.model.resendCode();
        },
        initialize: function() {
          this.$el.css({ display: 'none' });
          this.listenTo(this.model, 'change:ableToResend', function(model, ableToResend) {
            if (ableToResend) {
              this.options.title = formRetry;
              this.enable();
            } else {
              this.options.title = formSubmitted;
              this.disable();
            }
            this.render();
          });
        },
      }),
      FormType.Divider({
        showWhen: factorIdIsDefined,
      }),
      FormType.Input({
        label: loc('mfa.challenge.enterCode.placeholder', 'login'),
        'label-top': true,
        explain: Util.createInputExplain(
          'mfa.challenge.enterCode.tooltip',
          'mfa.challenge.enterCode.placeholder',
          'login'
        ),
        'explain-top': true,
        name: 'passCode',
        input: TextBox,
        type: 'tel',
        showWhen: factorIdIsDefined,
      }),
      FormType.Toolbar({
        noCancelButton: true,
        save: loc('mfa.challenge.verify', 'login'),
        showWhen: factorIdIsDefined,
      })
    );

    return {
      title: formTitle,
      noButtonBar: true,
      autoSave: true,
      className: getClassName(factorType),

      showWarning: function(msg) {
        this.clearWarnings();
        this.add(EnrollCallAndSmsControllerwarningTemplate, '.o-form-error-container', { options: { warning: msg } });
      },

      clearWarnings: function() {
        this.$('.okta-form-infobox-warning').remove();
      },

      initialize: function() {
        const callTimeWarning = hbs`{{i18n
          code="factor.call.time.warning"
          bundle="login"
          $1="<b>$1</b>"
        }}`;
        const smsTimeWarning = hbs`{{i18n
          code="factor.sms.time.warning"
          bundle="login"
          $1="<b>$1</b>"
        }}`;
        this.listenTo(this.model, 'change:ableToResend', function(model, ableToResend) {
          if (ableToResend) {
            this.showWarning(isCall ? callTimeWarning : smsTimeWarning);
          } else {
            this.clearWarnings();
          }
        });
        this.listenTo(this.model, 'error errors:clear', function() {
          this.clearWarnings();
          this.clearErrors();
        });
        this.listenTo(this.model, 'change:enrolled', function() {
          this.$('.js-enroll-phone').toggle();
        });
      },
      formChildren: formChildren,
    };
  },

  Footer: Footer,

  trapAuthResponse: function() {
    if (this.options.appState.get('isMfaEnrollActivate')) {
      this.model.set('factorId', this.options.appState.get('activatedFactorId'));
      return true;
    }
    if (this.options.appState.get('isMfaEnroll') && this.model.get('trapEnrollment')) {
      return true;
    }
  },

  initialize: function() {
    if (isCallFactor(this.options.factorType)) {
      this.model.set('hasExistingPhones', this.options.appState.get('hasExistingPhonesForCall'));
    } else {
      this.model.set('hasExistingPhones', this.options.appState.get('hasExistingPhones'));
    }
    this.model.set('factorType', this.options.factorType);
  },
});

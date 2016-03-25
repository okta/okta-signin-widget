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
  'util/FormController',
  'views/enroll-factors/Footer',
  'views/enroll-factors/PhoneTextBox',
  'util/CountryUtil',
  'util/FormType',
  'shared/util/Keys'
],
function (Okta, FormController, Footer, PhoneTextBox, CountryUtil, FormType, Keys) {

  var _ = Okta._;
  var API_RATE_LIMIT = 30000; //milliseconds

  var factorIdIsDefined = {
    factorId: function (val) {
      return !_.isUndefined(val);
    }
  };

  function sendCode(e) {
    if (Keys.isEnter(e)) {
      e.stopPropagation();
      e.preventDefault();
      if (e.type === 'keyup' && e.data && e.data.model) {
        e.data.model.sendCode();
      }
    }
  }

  return FormController.extend({
    className: 'enroll-sms',
    Model: {
      props: {
        countryCode: ['string', true, 'US'],
        phoneNumber: ['string', true],
        lastEnrolledPhoneNumber: 'string',
        passCode: ['string', true],
        factorId: 'string'
      },
      local: {
        hasExistingPhones: 'boolean',
        trapEnrollment: 'boolean',
        ableToResend: 'boolean'
      },
      derived: {
        countryCallingCode: {
          deps: ['countryCode'],
          fn: function (countryCode) {
            return '+' + CountryUtil.getCallingCodeForCountry(countryCode);
          }
        },
        fullPhoneNumber: {
          deps: ['countryCallingCode', 'phoneNumber'],
          fn: function (countryCallingCode, phoneNumber) {
            return countryCallingCode + phoneNumber;
          }
        },
        enrolled: {
          deps: ['lastEnrolledPhoneNumber', 'fullPhoneNumber'],
          fn: function (lastEnrolled, current) {
            return lastEnrolled === current;
          }
        }
      },
      limitResending: function () {
        this.set({ableToResend: false});
        _.delay(_.bind(this.set, this), API_RATE_LIMIT, {ableToResend: true});
      },
      sendCode: function () {
        var self = this;
        var phoneNumber = this.get('fullPhoneNumber');
        
        self.trigger('errors:clear');
        return this.doTransaction(function(transaction) {
          if (transaction.status === 'MFA_ENROLL') {
            var factor = _.findWhere(transaction.factors, {
              factorType: 'sms',
              provider: 'OKTA'
            });
            return factor.enroll({
              profile: {
                phoneNumber: phoneNumber,
                updatePhone: self.get('hasExistingPhones')
              }
            });
            
          } else {
            // We must transition to MfaEnroll before updating the phone number
            self.set('trapEnrollment', true);
            return transaction.prev()
            .then(function (trans) {
              var factor = _.findWhere(trans.factors, {
                factorType: 'sms',
                provider: 'OKTA'
              });
              return factor.enroll({
                profile: {
                  phoneNumber: phoneNumber,
                  updatePhone: true
                }
              });
            })
            .then(function (trans) {
              self.set('trapEnrollment', false);
              return trans;
            });
          }
        // Rethrow errors so we can change state 
        // AFTER setting the new transaction
        }, true)
        .then(function () {
          self.set('lastEnrolledPhoneNumber', phoneNumber);
          self.limitResending();
        })
        .fail(function () {
          self.set('ableToResend', true);
          self.set('trapEnrollment', false);
        });
      },
      resendCode: function () {
        this.trigger('errors:clear');
        this.limitResending();
        return this.doTransaction(function(transaction) {
          return transaction.resend('sms');
        });
      },
      save: function () {
        return this.doTransaction(function(transaction) {
          return transaction.activate({
            passCode: this.get('passCode')
          });
        });
      }
    },

    Form: {
      title: Okta.loc('enroll.sms.setup', 'login'),
      noButtonBar: true,
      autoSave: true,
      className: 'enroll-sms',
      initialize: function () {
        this.listenTo(this.model, 'error errors:clear', function () {
          this.clearErrors();
        });
        this.listenTo(this.model, 'change:enrolled', function () {
          this.$('.js-enroll-sms').toggle();
        });
      },
      formChildren: [
        FormType.Input({
          name: 'countryCode',
          type: 'select',
          wide: true,
          options: CountryUtil.getCountries()
        }),
        FormType.Input({
          placeholder: Okta.loc('mfa.phoneNumber.placeholder', 'login'),
          className: 'enroll-sms-phone',
          name: 'phoneNumber',
          input: PhoneTextBox,
          type: 'text',
          render: function () {
            this.$('input[name="phoneNumber"]')
              .off('keydown keyup', sendCode)
              .keydown(sendCode)
              .keyup({model: this.model}, sendCode);
          }
        }),
        FormType.Button({
          title: Okta.loc('mfa.sendCode', 'login'),
          attributes: { 'data-se': 'sms-request-button' },
          className: 'button button-primary js-enroll-sms sms-request-button',
          click: function () {
            this.model.sendCode();
          }
        }),
        FormType.Button({
          title: Okta.loc('mfa.resendCode', 'login'),
          attributes: { 'data-se': 'sms-request-button' },
          className: 'button js-enroll-sms sms-request-button',
          click: function () {
            this.model.resendCode();
          },
          initialize: function () {
            this.$el.css({display: 'none'});
            this.listenTo(this.model, 'change:ableToResend', function (model, ableToResend) {
              if (ableToResend) {
                this.options.title = Okta.loc('mfa.resendCode', 'login');
                this.enable();
                this.render();
              } else {
                this.options.title = Okta.loc('mfa.sent', 'login');
                this.disable();
                this.render();
              }
            });
          }
        }),
        FormType.Divider({
          showWhen: factorIdIsDefined
        }),
        FormType.Input({
          placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
          name: 'passCode',
          type: 'text',
          params: {
            innerTooltip: Okta.loc('mfa.challenge.enterCode.tooltip', 'login')
          },
          showWhen: factorIdIsDefined
        }),
        FormType.Toolbar({
          noCancelButton: true,
          save: Okta.loc('mfa.challenge.verify', 'login'),
          showWhen: factorIdIsDefined
        })
      ]
    },

    Footer: Footer,

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaEnrollActivate')) {
        this.model.set('factorId', this.options.appState.get('activatedFactorId'));
        return true;
      }
      if (this.options.appState.get('isMfaEnroll') && this.model.get('trapEnrollment')) {
        return true;
      }
    },

    initialize: function () {
      this.model.set('hasExistingPhones', this.options.appState.get('hasExistingPhones'));
    }

  });

});

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
  'views/shared/TextBox',
  'util/CountryUtil',
  'util/FormType',
  'shared/util/Keys'
],
function (Okta, FormController, Footer, PhoneTextBox, TextBox, CountryUtil, FormType, Keys) {

  var _ = Okta._;
  var API_RATE_LIMIT = 30000; //milliseconds

  var factorIdIsDefined = {
    factorId: function (val) {
      return !_.isUndefined(val);
    }
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

  return FormController.extend({
    className: function () {
      return getClassName(this.options.factorType);
    },
    Model: {
      props: {
        countryCode: ['string', true, 'US'],
        phoneNumber: ['string', true],
        phoneExtension: ['string', false],
        lastEnrolledPhoneNumber: 'string',
        passCode: ['string', true],
        factorId: 'string'
      },
      local: {
        hasExistingPhones: 'boolean',
        trapEnrollment: 'boolean',
        ableToResend: 'boolean',
        factorType: 'string'
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
            return phoneNumber ? (countryCallingCode + phoneNumber) : '';
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
        var phoneExtension = this.get('phoneExtension');

        self.trigger('errors:clear');
        return this.doTransaction(function(transaction) {
          var isMfaEnroll = transaction.status === 'MFA_ENROLL';
          var profileData = {
            phoneNumber: phoneNumber,
            updatePhone: isMfaEnroll ? self.get('hasExistingPhones') : true
          };
          if (isCallFactor(self.get('factorType'))) {
            profileData['phoneExtension'] = phoneExtension;
          }

          if (isMfaEnroll) {
            var factor = _.findWhere(transaction.factors, {
              factorType: self.get('factorType'),
              provider: 'OKTA'
            });
            return factor.enroll({
              profile: profileData
            });

          } else {
            // We must transition to MfaEnroll before updating the phone number
            self.set('trapEnrollment', true);
            return transaction.prev()
            .then(function (trans) {
              var factor = _.findWhere(trans.factors, {
                factorType: self.get('factorType'),
                provider: 'OKTA'
              });
              return factor.enroll({
                profile: profileData
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
          return transaction.resend(this.get('factorType'));
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

    Form: function () {
      /*jshint maxcomplexity:8*/
      var factorType = this.options.factorType;
      var isCall = isCallFactor(factorType);

      var formTitle = Okta.loc(isCall ? 'enroll.call.setup' : 'enroll.sms.setup', 'login');
      var formSubmit = Okta.loc(isCall ? 'mfa.call' : 'mfa.sendCode', 'login');
      var formRetry = Okta.loc(isCall ? 'mfa.redial' : 'mfa.resendCode', 'login');
      var formSubmitted = Okta.loc(isCall ? 'mfa.calling' : 'mfa.sent', 'login');

      var numberFieldClassName = isCall ? 'enroll-call-phone' : 'enroll-sms-phone';
      var buttonClassName = isCall ? 'call-request-button' : 'sms-request-button';

      var formChildren = [
        FormType.Input({
          name: 'countryCode',
          type: 'select',
          wide: true,
          options: CountryUtil.getCountries()
        }),
        FormType.Input({
          placeholder: Okta.loc('mfa.phoneNumber.placeholder', 'login'),
          className: numberFieldClassName,
          name: 'phoneNumber',
          input: PhoneTextBox,
          type: 'text',
          render: function () {
            this.$('input[name="phoneNumber"]')
              .off('keydown keyup', sendCode)
              .keydown(sendCode)
              .keyup({model: this.model}, sendCode);
          }
        })
      ];
      if (isCall) {
        formChildren.push(FormType.Input({
          placeholder: Okta.loc('mfa.phoneNumber.ext.placeholder', 'login'),
          className: 'enroll-call-extension',
          name: 'phoneExtension',
          input: TextBox,
          type: 'text'
        }));
      }
      formChildren.push(
        FormType.Button({
          title: formSubmit,
          attributes: { 'data-se': buttonClassName },
          className: 'button button-primary js-enroll-phone ' + buttonClassName,
          click: function () {
            this.model.sendCode();
          }
        }),
        FormType.Button({
          title: formRetry,
          attributes: { 'data-se': buttonClassName },
          className: 'button js-enroll-phone ' + buttonClassName,
          click: function () {
            this.model.resendCode();
          },
          initialize: function () {
            this.$el.css({display: 'none'});
            this.listenTo(this.model, 'change:ableToResend', function (model, ableToResend) {
              if (ableToResend) {
                this.options.title = formRetry;
                this.enable();
              } else {
                this.options.title = formSubmitted;
                this.disable();
              }
              this.render();
            });
          }
        }),
        FormType.Divider({
          showWhen: factorIdIsDefined
        }),
        FormType.Input({
          placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
          name: 'passCode',
          input: TextBox,
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
      );

      return {
        title: formTitle,
        noButtonBar: true,
        autoSave: true,
        className: getClassName(factorType),
        initialize: function () {
          this.listenTo(this.model, 'error errors:clear', function () {
            this.clearErrors();
          });
          this.listenTo(this.model, 'change:enrolled', function () {
            this.$('.js-enroll-phone').toggle();
          });
        },
        formChildren: formChildren
      };
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
      if (isCallFactor(this.options.factorType)) {
        this.model.set('hasExistingPhones', this.options.appState.get('hasExistingPhonesForCall'));
      } else {
        this.model.set('hasExistingPhones', this.options.appState.get('hasExistingPhones'));
      }
      this.model.set('factorType', this.options.factorType);
    }

  });

});

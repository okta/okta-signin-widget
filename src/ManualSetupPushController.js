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

define([
  'okta',
  'util/CountryUtil',
  'util/FactorUtil',
  'util/FormController',
  'util/FormType',
  'util/RouterUtil',
  'views/enroll-factors/ManualSetupPushFooter',
  'views/enroll-factors/PhoneTextBox',
  'views/shared/TextBox'
],
function (Okta, CountryUtil, FactorUtil, FormController, FormType, RouterUtil,
  Footer, PhoneTextBox, TextBox) {

  var _ = Okta._;

  function goToFactorActivation (view, step) {
    var url = RouterUtil.createActivateFactorUrl(view.options.appState.get('activatedFactorProvider'),
      view.options.appState.get('activatedFactorType'), step);
    view.options.appState.trigger('navigate', url);
  }

  function setStateValues (view) {
    var userPhoneNumber, userCountryCode;
    if (view.model.get('activationType') === 'SMS') {
      userCountryCode = view.model.get('countryCode');
      userPhoneNumber = view.model.get('phoneNumber');
    }
    view.options.appState.set({
      factorActivationType: view.model.get('activationType'),
      userCountryCode: userCountryCode,
      userPhoneNumber: userPhoneNumber
    });
  }

  function enrollFactor (view, factorType) {
    return view.model.doTransaction(function (transaction) {
      return transaction.prev()
        .then(function (trans) {
          var factor = _.findWhere(trans.factors, {
            factorType: factorType,
            provider: 'OKTA'
          });
          return factor.enroll();
        })
        .then(function (trans) {
          var textActivationLinkUrl,
              emailActivationLinkUrl,
              sharedSecret,
              res = trans.data;

          if (res &&
            res._embedded &&
            res._embedded.factor &&
            res._embedded.factor._embedded &&
            res._embedded.factor._embedded.activation) {

            var factor = res._embedded.factor;

            // Shared secret
            sharedSecret = factor._embedded.activation.sharedSecret;

            if (factor._embedded.activation._links &&
              factor._embedded.activation._links.send) {

              var activationSendLinks = factor._embedded.activation._links.send;

              // SMS activation url
              var smsItem = _.findWhere(activationSendLinks, {name: 'sms'});
              textActivationLinkUrl = smsItem ? smsItem.href : null;

              // Email activation url
              var emailItem = _.findWhere(activationSendLinks, {name: 'email'});
              emailActivationLinkUrl = emailItem ? emailItem.href : null;
            }
          }

          view.model.set({
            'SMS': textActivationLinkUrl,
            'EMAIL': emailActivationLinkUrl,
            'sharedSecret': sharedSecret
          });

          return trans;
        });
    });
  }

  return FormController.extend({
    className: 'enroll-manual-push',
    Model: function () {
      return {
        local: {
          activationType: ['string', true, this.options.appState.get('factorActivationType') || 'SMS'],
          countryCode: ['string', false, 'US'],
          phoneNumber: 'string',
          'SMS': ['string', false, this.options.appState.get('textActivationLinkUrl')],
          'EMAIL': ['string', false, this.options.appState.get('emailActivationLinkUrl')],
          'sharedSecret': ['string', false, this.options.appState.get('sharedSecret')],
          '__factorType__': ['string', false, this.options.factorType],
          '__provider__': ['string', false, this.options.provider]
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
          }
        }
      };
    },

    Form: {
      title: function () {
        var factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));
        return Okta.loc('enroll.totp.title', 'login', [factorName]);
      },
      subtitle: _.partial(Okta.loc, 'enroll.totp.cannotScanBarcode', 'login'),
      noButtonBar: true,
      attributes: { 'data-se': 'step-manual-setup' },

      formChildren: function () {
        var instructions = this.settings.get('brandName') ?
          Okta.loc('enroll.totp.sharedSecretInstructions.specific', 'login', [this.settings.get('brandName')]) :
          Okta.loc('enroll.totp.sharedSecretInstructions.generic', 'login');
        var children = [
          FormType.Input({
            name: 'activationType',
            type: 'select',
            wide: true,
            options: {
              SMS: Okta.loc('enroll.totp.sendSms', 'login'),
              EMAIL: Okta.loc('enroll.totp.sendEmail', 'login'),
              MANUAL: Okta.loc('enroll.totp.setupManually', 'login')
            }
          }),

          FormType.Input({
            name: 'countryCode',
            type: 'select',
            wide: true,
            options: CountryUtil.getCountries(),
            showWhen: {activationType: 'SMS'}
          }),

          FormType.Input({
            label: Okta.loc('mfa.phoneNumber.placeholder', 'login'),
            'label-top': true,
            className: 'enroll-sms-phone',
            name: 'phoneNumber',
            input: PhoneTextBox,
            type: 'text',
            showWhen: {activationType: 'SMS'}
          }),

          FormType.View({
            View: Okta.View.extend({
              template: hbs('\
                <p class="okta-form-subtitle o-form-explain text-align-c">\
                  {{instructions}}\
                </p>\
              '),
              getTemplateData: function () {
                return {
                  instructions: instructions
                };
              }
            }),
            showWhen: {activationType: 'MANUAL'}
          }),

          FormType.Input({
            name: 'sharedSecret',
            input: TextBox,
            type: 'text',
            disabled: true,
            showWhen: {activationType: 'MANUAL'},
            initialize: function () {
              this.listenTo(this.model, 'change:sharedSecret', this.render);
            }
          }),

          FormType.View({
            View: Okta.View.extend({
              template: hbs('<div data-type="next-button-wrap"></div>')
            }),
            showWhen: {activationType: 'MANUAL'}
          }),

          FormType.Button({
            title: Okta.loc('oform.next', 'login'),
            className: 'button button-primary button-wide button-next',
            attributes: {'data-se': 'next-button'},
            click: _.bind(function () {
              setStateValues(this);
              goToFactorActivation(this, 'passcode');
            }, this)
          }, '[data-type="next-button-wrap"]'),

          FormType.Toolbar({
            noCancelButton: true,
            save: Okta.loc('oform.send', 'login'),
            showWhen: {
              activationType: function (val) {
                return val === 'SMS' || val === 'EMAIL';
              }
            }
          })
        ];
        return children;
      }
    },

    Footer: Footer,

    initialize: function () {
      this.setInitialModel();
      // Move this logic to a model when AuthClient supports sending email and sms
      this.listenTo(this.form, 'save', function () {
        var self = this;
        this.model.doTransaction(function (transaction) {
          var activationType = this.get('activationType').toLowerCase(),
              opts = {};

          if (activationType === 'sms') {
            opts.profile = {phoneNumber: this.get('fullPhoneNumber')};
          }

          return transaction.factor.activation.send(activationType, opts)
            .then(function (trans) {
              setStateValues(self);
              // Note: Need to defer because OktaAuth calls our router success
              // handler on the next tick - if we immediately called, appState would
              // still be populated with the last response
              _.defer(function () {
                goToFactorActivation(self, 'sent');
              });
              return trans;
            });
        });
      });

      this.listenTo(this.model, 'change:activationType', function (model, value) {
        this.form.clearErrors();
        if (value === 'MANUAL' && this.options.appState.get('activatedFactorType') !== 'token:software:totp') {
          enrollFactor(this, 'token:software:totp');
        } else if (this.options.appState.get('activatedFactorType') !== 'push') {
          enrollFactor(this, 'push');
        }
      });
    },

    setInitialModel: function () {
      if (this.options.appState.get('factorActivationType') === 'SMS') {
        this.model.set({
          countryCode: this.options.appState.get('userCountryCode') || 'US',
          phoneNumber: this.options.appState.get('userPhoneNumber')
        });
      }
    },

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaEnrollActivate') ||
        this.options.appState.get('isMfaEnroll')) {
        return true;
      }
    }
  });

});

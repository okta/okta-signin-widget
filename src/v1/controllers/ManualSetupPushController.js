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

import { _, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import CountryUtil from 'util/CountryUtil';
import FactorUtil from 'util/FactorUtil';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import RouterUtil from 'v1/util/RouterUtil';
import Footer from 'v1/views/enroll-factors/ManualSetupPushFooter';
import PhoneTextBox from 'v1/views/enroll-factors/PhoneTextBox';

function goToFactorActivation(view, step) {
  const url = RouterUtil.createActivateFactorUrl(
    view.options.appState.get('activatedFactorProvider'),
    view.options.appState.get('activatedFactorType'),
    step
  );

  view.options.appState.trigger('navigate', url);
}

function setStateValues(view) {
  let userPhoneNumber;
  let userCountryCode;

  if (view.model.get('activationType') === 'SMS') {
    userCountryCode = view.model.get('countryCode');
    userPhoneNumber = view.model.get('phoneNumber');
  }
  view.options.appState.set({
    factorActivationType: view.model.get('activationType'),
    userCountryCode: userCountryCode,
    userPhoneNumber: userPhoneNumber,
  });
}

function enrollFactor(view, factorType) {
  return view.model.doTransaction(function(transaction) {
    return transaction
      .prev()
      .then(function(trans) {
        const factor = _.findWhere(trans.factors, {
          factorType: factorType,
          provider: 'OKTA',
        });

        return factor.enroll();
      })
      .then(function(trans) {
        let textActivationLinkUrl;
        let emailActivationLinkUrl;
        let sharedSecret;
        const res = trans.data;

        if (
          res &&
          res._embedded &&
          res._embedded.factor &&
          res._embedded.factor._embedded &&
          res._embedded.factor._embedded.activation
        ) {
          const factor = res._embedded.factor;

          // Shared secret
          sharedSecret = factor._embedded.activation.sharedSecret;

          if (factor._embedded.activation._links && factor._embedded.activation._links.send) {
            const activationSendLinks = factor._embedded.activation._links.send;

            const smsItem = _.findWhere(activationSendLinks, { name: 'sms' });

            // SMS activation url

            textActivationLinkUrl = smsItem ? smsItem.href : null;

            // Email activation url

            const emailItem = _.findWhere(activationSendLinks, { name: 'email' });

            emailActivationLinkUrl = emailItem ? emailItem.href : null;
          }
        }

        view.model.set({
          SMS: textActivationLinkUrl,
          EMAIL: emailActivationLinkUrl,
          sharedSecret: sharedSecret,
        });

        return trans;
      });
  });
}

export default FormController.extend({
  className: 'enroll-manual-push',
  Model: function() {
    return {
      local: {
        activationType: ['string', true, this.options.appState.get('factorActivationType') || 'SMS'],
        countryCode: ['string', false, this.options.appState.get('userCountryCode')],
        phoneNumber: 'string',
        SMS: ['string', false, this.options.appState.get('textActivationLinkUrl')],
        EMAIL: ['string', false, this.options.appState.get('emailActivationLinkUrl')],
        sharedSecret: ['string', false, this.options.appState.get('sharedSecret')],
        __factorType__: ['string', false, this.options.factorType],
        __provider__: ['string', false, this.options.provider],
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
            return countryCallingCode + phoneNumber;
          },
        },
      },
    };
  },

  Form: {
    title: function() {
      const factorName = FactorUtil.getFactorLabel(this.model.get('__provider__'), this.model.get('__factorType__'));

      return loc('enroll.totp.title', 'login', [factorName]);
    },
    subtitle: _.partial(loc, 'enroll.totp.cannotScanBarcode', 'login'),
    noButtonBar: true,
    attributes: { 'data-se': 'step-manual-setup' },

    formChildren: function() {
      const instructions = this.settings.get('brandName')
        ? loc('enroll.totp.sharedSecretInstructions.specific', 'login', [this.settings.get('brandName')])
        : loc('enroll.totp.sharedSecretInstructions.generic', 'login');
      const children = [
        FormType.Input({
          name: 'activationType',
          label:loc('mfa.setupOptions', 'login'),
          type: 'select',
          wide: true,
          options: {
            SMS: loc('enroll.totp.sendSms', 'login'),
            EMAIL: loc('enroll.totp.sendEmail', 'login'),
            MANUAL: loc('enroll.totp.setupManually', 'login'),
          },
        }),
        FormType.Input({
          label:loc('mfa.country', 'login'),
          name: 'countryCode',
          type: 'select',
          wide: true,
          options: CountryUtil.getCountries(),
          showWhen: { activationType: 'SMS' },
        }),
        FormType.Input({
          label: loc('mfa.phoneNumber.placeholder', 'login'),
          'label-top': true,
          className: 'enroll-sms-phone',
          name: 'phoneNumber',
          input: PhoneTextBox,
          type: 'text',
          showWhen: { activationType: 'SMS' },
        }),
        FormType.View({
          View: View.extend({
            className: 'secret-key-instructions',
            attributes: { 'data-se': 'secret-key-instructions'},
            template: hbs`
             <section aria-live="assertive">
                <p  class="okta-form-subtitle o-form-explain text-align-c">
                  {{instructions}}
                </p>
                <p class="shared-key margin-top-10" tabindex=0 
                aria-label="{{i18n code="enroll.totp.sharedSecretInstructions.aria.secretKey" bundle="login"
                arguments="sharedSecretKey"}}">{{sharedSecretKey}}</p>
              </section>
              `,
            initialize: function(){
              this.listenTo(this.model, 'change:sharedSecret', this.render);
            },
            getTemplateData: function() {
              return {
                instructions: instructions,
                sharedSecretKey: this.model.get('sharedSecret')
              };
            },
          }),
          showWhen: { activationType: 'MANUAL' },
        }),
        FormType.View({
          View: View.extend({
            template: hbs('<div data-type="next-button-wrap"></div>'),
          }),
          showWhen: { activationType: 'MANUAL' },
        }),
        FormType.Button(
          {
            title: loc('oform.next', 'login'),
            className: 'button button-primary button-wide button-next',
            attributes: { 'data-se': 'next-button' },
            click: () => {
              setStateValues(this);
              goToFactorActivation(this, 'passcode');
            },
          },
          '[data-type="next-button-wrap"]'
        ),
        FormType.Toolbar({
          noCancelButton: true,
          save: loc('oform.send', 'login'),
          showWhen: {
            activationType: function(val) {
              return val === 'SMS' || val === 'EMAIL';
            },
          },
        }),
      ];

      return children;
    },
  },

  Footer: Footer,

  initialize: function() {
    this.setInitialModel();
    // Move this logic to a model when AuthClient supports sending email and sms
    this.listenTo(this.form, 'save', function() {
      const self = this;

      this.model.doTransaction(function(transaction) {
        const activationType = this.get('activationType').toLowerCase();
        const opts = {};

        if (activationType === 'sms') {
          opts.profile = { phoneNumber: this.get('fullPhoneNumber') };
        }

        return transaction.factor.activation.send(activationType, opts).then(function(trans) {
          setStateValues(self);
          // Note: Need to defer because OktaAuth calls our router success
          // handler on the next tick - if we immediately called, appState would
          // still be populated with the last response
          _.defer(function() {
            goToFactorActivation(self, 'sent');
          });
          return trans;
        });
      });
    });

    this.listenTo(this.model, 'change:activationType', function(model, value) {
      this.form.clearErrors();
      if (value === 'MANUAL' && this.options.appState.get('activatedFactorType') !== 'token:software:totp') {
        enrollFactor(this, 'token:software:totp');
      } else if (this.options.appState.get('activatedFactorType') !== 'push') {
        enrollFactor(this, 'push');
      }
    });
  },

  setInitialModel: function() {
    if (this.options.appState.get('factorActivationType') === 'SMS') {
      this.model.set({
        countryCode: this.options.appState.get('userCountryCode') || 'US',
        phoneNumber: this.options.appState.get('userPhoneNumber'),
      });
    }
  },

  trapAuthResponse: function() {
    if (this.options.appState.get('isMfaEnrollActivate') || this.options.appState.get('isMfaEnroll')) {
      return true;
    }
  },
});

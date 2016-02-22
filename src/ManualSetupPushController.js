/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define([
  'okta',
  'util/CountryUtil',
  'util/FactorUtil',
  'util/FormController',
  'util/FormType',
  'util/RouterUtil',
  'views/enroll-factors/ManualSetupPushFooter',
  'views/enroll-factors/PhoneTextBox'
],
function (Okta, CountryUtil, FactorUtil, FormController, FormType, RouterUtil,
          Footer, PhoneTextBox) {

  var _ = Okta._;

  function goToFactorActivation(view, step) {
    var url = RouterUtil.createActivateFactorUrl(view.options.appState.get('activatedFactorProvider'),
      view.options.appState.get('activatedFactorType'), step);
    view.options.appState.trigger('navigate', url);
  }

  function setStateValues(view) {
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

  function enrollFactor(view, factorType) {
    return view.model.doTransaction(function(transaction) {
      return transaction.previous()
      .then(function (trans) {
        return trans
          .getFactorByTypeAndProvider(factorType, 'OKTA')
          .enrollFactor();
      })
      .then(function (trans) {
        var textActivationLinkUrl,
            emailActivationLinkUrl,
            sharedSecret,
            res = trans.response;

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
      subtitle: Okta.loc('enroll.totp.cannotScanBarcode', 'login'),
      noButtonBar: true,
      attributes: { 'data-se': 'step-manual-setup' },

      formChildren: function () {
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
            placeholder: Okta.loc('mfa.phoneNumber.placeholder', 'login'),
            className: 'enroll-sms-phone',
            name: 'phoneNumber',
            input: PhoneTextBox,
            type: 'text',
            showWhen: {activationType: 'SMS'}
          }),

          FormType.View({
            View: '\
              <p class="okta-form-subtitle o-form-explain text-align-c">\
                {{i18n code="enroll.totp.sharedSecretInstructions" bundle="login"}}\
              </p>\
            ',
            showWhen: {activationType: 'MANUAL'}
          }),

          FormType.Input({
            name: 'sharedSecret',
            type: 'text',
            disabled: true,
            showWhen: {activationType: 'MANUAL'},
            initialize: function () {
              this.listenTo(this.model, 'change:sharedSecret', this.render);
            }
          }),

          FormType.View({
            View: '<div data-type="next-button-wrap"></div>',
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
        var activationType = this.model.get('activationType'),
            self = this,
            profile;
        if (activationType === 'SMS') {
          profile = {phoneNumber: this.model.get('fullPhoneNumber')};
        } else {
          profile = undefined;
        }

        this.settings.getAuthClient().post(this.model.get(activationType), {
          stateToken: this.options.appState.get('lastAuthResponse').stateToken,
          profile: profile
        })
        .then(function (res) {
          self.options.appState.setAuthResponse(res);
          setStateValues(self);
          // Note: Need to defer because OktaAuth calls our router success
          // handler on the next tick - if we immediately called, appState would
          // still be populated with the last response
          _.defer(function () {
            goToFactorActivation(self, 'sent');
          });
        })
        .fail(function (err) {
          self.model.trigger('error', self.model, err.xhr);
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

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

/* eslint complexity:[2, 10], max-params: [2, 11] */
import hbs from 'handlebars-inline-precompile';
define([
  'okta',
  'util/Errors',
  'util/FormController',
  'util/FormType',
  'util/CryptoUtil',
  'util/webauthn',
  'views/shared/FooterSignout',
  'q',
  'util/FactorUtil',
  'views/mfa-verify/HtmlErrorMessageView'
],
function (Okta, Errors, FormController, FormType, CryptoUtil, webauthn, FooterSignout, Q,
  FactorUtil, HtmlErrorMessageView) {

  var _ = Okta._;

  function getAllowCredentials (factors) {
    var allowCredentials = [];
    _.each(factors, function (factor) {
      allowCredentials.push({
        type: 'public-key',
        id: CryptoUtil.strToBin(factor.profile.credentialId)
      });
    });
    return allowCredentials;
  }

  return FormController.extend({
    className: 'mfa-verify verify-webauthn',
    Model: {
      props: {
        rememberDevice: 'boolean'
      },

      initialize: function () {
        var rememberDevice = FactorUtil.getRememberDeviceValue(this.appState);
        // set the initial value for remember device (Cannot do this while defining the
        // local property because this.settings would not be initialized there yet).
        this.set('rememberDevice', rememberDevice);
        this.appState.on('factorSwitched signOut', () => {
          if (this.webauthnAbortController) {
            this.webauthnAbortController.abort();
            this.webauthnAbortController = null;
          }
        });
      },

      save: function () {
        this.trigger('request');

        return this.doTransaction(function (transaction) {
          var factor;
          if (transaction.factorTypes) {
            factor = _.findWhere(transaction.factorTypes, {
              factorType: 'webauthn'
            });
          }
          else {
            factor = _.findWhere(transaction.factors, {
              factorType: 'webauthn',
              provider: 'FIDO'
            });
          }

          var self = this;
          return factor.verify().then(function (transaction) {
            var allowCredentials, challenge;
            if (transaction.factors) {
              var factors = transaction.factors;
              challenge = transaction.challenge;
              allowCredentials = getAllowCredentials(factors);
            }
            else {
              var factorData = transaction.factor;
              challenge = factorData.challenge;
              allowCredentials = getAllowCredentials([factorData]);
            }
            self.trigger('request');
            // verify via browser webauthn js
            var options = _.extend({}, challenge, {
              allowCredentials: allowCredentials,
              challenge: CryptoUtil.strToBin(challenge.challenge)
            });
            self.webauthnAbortController = new AbortController();
            return new Q(navigator.credentials.get({
              publicKey: options,
              signal: self.webauthnAbortController.signal
            }))
              .then(function (assertion) {
                var rememberDevice = !!self.get('rememberDevice');
                return factor.verify({
                  clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
                  authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
                  signatureData: CryptoUtil.binToStr(assertion.response.signature),
                  rememberDevice: rememberDevice
                });
              })
              .catch(function (error) {
                self.trigger('errors:clear');
                // Do not display if it is abort error triggered by code when switching.
                // self.webauthnAbortController would be null if abort was triggered by code.
                if (!self.webauthnAbortController) {
                  throw new Errors.WebauthnAbortError();
                } else {
                  throw new Errors.WebAuthnError({
                    xhr: {responseJSON: {errorSummary: error.message}}
                  });
                }
              }).finally(function () {
                // unset webauthnAbortController on successful authentication or error
                self.webauthnAbortController = null;
              });
          });
        });
      }
    },

    Form: {
      autoSave: true,
      hasSavingState: false,
      title: _.partial(Okta.loc, 'factor.webauthn.biometric', 'login'),
      className: 'verify-webauthn-form',
      noCancelButton: true,
      save: _.partial(Okta.loc, 'verify.u2f.retry', 'login'),
      noButtonBar: function () {
        return !webauthn.isNewApiAvailable();
      },
      modelEvents: {
        'request': '_startEnrollment',
        'error': '_stopEnrollment'
      },

      formChildren: function () {
        var children = [];

        if (webauthn.isNewApiAvailable()) {
          children.push(FormType.View({
            View: Okta.View.extend({
              template: hbs('<div class="webauthn-verify-text">\
                 <p>{{i18n code="verify.webauthn.biometric.instructions" bundle="login"}}</p>\
                 <div data-se="webauthn-waiting" class="okta-waiting-spinner"></div>\
               </div>')
            })
          }));
        }
        else {
          var errorMessageKey = 'webauthn.biometric.error.factorNotSupported';
          if (this.options.appState.get('factors').length === 1) {
            errorMessageKey = 'webauthn.biometric.error.factorNotSupported.oneFactor';
          }
          children.push(FormType.View(
            {View: new HtmlErrorMessageView({message: Okta.loc(errorMessageKey, 'login')})},
            {selector: '.o-form-error-container'}
          ));
        }

        if (this.options.appState.get('allowRememberDevice')) {
          children.push(FormType.Input({
            label: false,
            'label-top': true,
            placeholder: this.options.appState.get('rememberDeviceLabel'),
            className: 'margin-btm-0',
            name: 'rememberDevice',
            type: 'checkbox'
          }));
        }

        return children;
      },

      postRender: function () {
        _.defer(_.bind(function () {
          if (webauthn.isNewApiAvailable()) {
            this.model.save();
          }
          else {
            this.$('[data-se="webauthn-waiting"]').hide();
          }
        }, this));
      },

      _startEnrollment: function () {
        this.$('.okta-waiting-spinner').show();
        this.$('.o-form-button-bar').hide();
      },

      _stopEnrollment: function () {
        this.$('.okta-waiting-spinner').hide();
        this.$('.o-form-button-bar').show();
      }
    },

    back: function () {
      // Empty function on verify controllers to prevent users
      // from navigating back during 'verify' using the browser's
      // back button. The URL will still change, but the view will not
      // More details in OKTA-135060.
    },

    Footer: FooterSignout
  });

});

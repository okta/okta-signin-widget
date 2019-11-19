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
  'util/Errors',
  'util/FormType',
  'util/FormController',
  'util/CryptoUtil',
  'util/webauthn',
  'views/enroll-factors/Footer',
  'q',
  'views/mfa-verify/HtmlErrorMessageView',
  'util/BrowserFeatures'
],
function (Okta, Errors, FormType, FormController, CryptoUtil, webauthn, Footer, Q,
  HtmlErrorMessageView, BrowserFeatures) {

  var _ = Okta._;

  function getExcludeCredentials (credentials) {
    var excludeCredentials = [];
    _.each(credentials, function (credential) {
      excludeCredentials.push({
        type: 'public-key',
        id: CryptoUtil.strToBin(credential.id)
      });
    });
    return excludeCredentials;
  }  

  return FormController.extend({
    className: 'enroll-webauthn',
    Model: {
      local: {
        '__enrolled__': 'boolean'
      },

      save: function () {
        this.trigger('request');

        if (this.get('__enrolled__')) {
          return this.activate();
        }

        return this.doTransaction(function (transaction) {
          var factor = _.findWhere(transaction.factors, {
            factorType: 'webauthn',
            provider: 'FIDO'
          });
          return factor.enroll();
        });
      },

      activate: function () {
        this.set('__enrolled__', true);
        this.trigger('errors:clear');
        this.appState.on('backToFactors', () => {
          if (this.webauthnAbortController) {
            this.webauthnAbortController.abort();
            this.webauthnAbortController = null;
          }
        });

        return this.doTransaction(function (transaction) {
          // enroll via browser webauthn js
          var activation = transaction.factor.activation;
          var self = this;
          if (webauthn.isNewApiAvailable()) {
            var options = _.extend({}, activation, {
              challenge: CryptoUtil.strToBin(activation.challenge),
              user: {
                id: CryptoUtil.strToBin(activation.user.id),
                name: activation.user.name,
                displayName: activation.user.displayName
              },
              excludeCredentials: getExcludeCredentials(activation.excludeCredentials)
            });
            self.webauthnAbortController = new AbortController();
            return new Q(navigator.credentials.create({
              publicKey: options,
              signal: self.webauthnAbortController.signal
            }))
              .then(function (newCredential) {
                return transaction.activate({
                  attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
                  clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON)
                });
              })
              .fail(function (error) {
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
          }
        });
      }
    },

    Form: {
      title: _.partial(Okta.loc, 'enroll.webauthn.biometric.title', 'login'),
      save: _.partial(Okta.loc, 'enroll.webauthn.save', 'login'),
      noCancelButton: true,
      hasSavingState: false,
      autoSave: true,
      className: 'enroll-webauthn-form',
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
          //enroll.webauthn.biometric.instructions.edge is unescaped because it contains html
          children.push(FormType.View({
            View: Okta.View.extend({
              className: 'webauthn-enroll-text',
              template: '\
                <div class="webauthn-enroll-instructions">\
                  <p>{{i18n code="enroll.webauthn.biometric.instructions" bundle="login"}}</p>\
                </div>\
                {{#if isEdge}}\
                  <div class="webauthn-edge-text">\
                     <p>{{{i18n code="enroll.webauthn.biometric.instructions.edge" bundle="login"}}}</p>\
                  </div>\
                {{/if}}\
                {{#if onlySupportsSecurityKey}}\
                  <div class="webauthn-restrictions-text">\
                     <p>{{{i18n code="enroll.webauthn.instructions.noSupportForBiometric" bundle="login"}}}</p>\
                  </div>\
                {{/if}}\
                <div data-se="webauthn-waiting" class="okta-waiting-spinner hide"></div>\
              ',
              getTemplateData: function () {
                return {
                  isEdge: BrowserFeatures.isEdge(),
                  onlySupportsSecurityKey: (BrowserFeatures.isFirefox() || BrowserFeatures.isSafari())
                    && (BrowserFeatures.isMac())
                };
              }
            })
          }));
        } else {
          var errorMessageKey = 'webauthn.biometric.error.factorNotSupported';
          if (this.options.appState.get('factors').length === 1) {
            errorMessageKey = 'webauthn.biometric.error.factorNotSupported.oneFactor';
          }
          children.push(FormType.View(
            {View: new HtmlErrorMessageView({message: Okta.loc(errorMessageKey, 'login')})},
            {selector: '.o-form-error-container'}
          ));
        }

        return children;
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

    Footer: Footer,

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaEnrollActivate')) {
        this.model.activate();
        return true;
      }
    }
  });

});

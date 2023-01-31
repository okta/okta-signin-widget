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
import Q from 'q';
import BrowserFeatures from 'util/BrowserFeatures';
import CryptoUtil from 'util/CryptoUtil';
import { WebauthnAbortError, WebAuthnError } from 'util/Errors';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import webauthn from 'util/webauthn';
import Footer from 'v1/views/enroll-factors/Footer';
import HtmlErrorMessageView from 'v1/views/mfa-verify/HtmlErrorMessageView';

function getExcludeCredentials(credentials) {
  const excludeCredentials = [];

  _.each(credentials, function(credential) {
    excludeCredentials.push({
      type: 'public-key',
      id: CryptoUtil.strToBin(credential.id),
    });
  });
  return excludeCredentials;
}

export default FormController.extend({
  className: 'enroll-webauthn',
  Model: {
    local: {
      __enrolled__: 'boolean',
    },

    save: function() {
      this.trigger('request');

      if (this.get('__enrolled__')) {
        return this.activate();
      }

      return this.doTransaction(function(transaction) {
        const factor = _.findWhere(transaction.factors, {
          factorType: 'webauthn',
          provider: 'FIDO',
        });

        return factor.enroll();
      });
    },

    activate: function() {
      this.set('__enrolled__', true);
      this.trigger('errors:clear');
      this.appState.on('backToFactors', () => {
        if (this.webauthnAbortController) {
          this.webauthnAbortController.abort();
          this.webauthnAbortController = null;
        }
      });

      return this.doTransaction(function(transaction) {
        const activation = transaction.factor.activation;
        // enroll via browser webauthn js

        const self = this;

        if (webauthn.isNewApiAvailable()) {
          const options = _.extend({}, activation, {
            challenge: CryptoUtil.strToBin(activation.challenge),
            user: {
              id: CryptoUtil.strToBin(activation.user.id),
              name: activation.user.name,
              displayName: activation.user.displayName,
            },
            excludeCredentials: getExcludeCredentials(activation.excludeCredentials),
          });

          // AbortController is not supported in IE11
          if (typeof AbortController !== 'undefined') {
            self.webauthnAbortController = new AbortController();
          }
          return new Q(
            navigator.credentials.create({
              publicKey: options,
              signal: self.webauthnAbortController && self.webauthnAbortController.signal,
            })
          )
            .then(function(newCredential) {
              return transaction.activate({
                attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
                clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
                // example data: ["nfc", "usb"]
                transports: webauthn.processWebAuthnResponse(newCredential.response.getTransports,
                  newCredential.response),
                // example data: {"credProps":{"rk":true}}
                clientExtensions: webauthn.processWebAuthnResponse(newCredential.getClientExtensionResults,
                  newCredential)
              });
            })
            .catch(function(error) {
              self.trigger('errors:clear');
              // Do not display if it is abort error triggered by code when switching.
              // self.webauthnAbortController would be null if abort was triggered by code.
              if (!self.webauthnAbortController) {
                throw new WebauthnAbortError();
              } else {
                throw new WebAuthnError({
                  xhr: { responseJSON: { errorSummary: error.message } },
                });
              }
            })
            .finally(function() {
              // unset webauthnAbortController on successful authentication or error
              self.webauthnAbortController = null;
            });
        }
      });
    },
  },

  Form: {
    title: _.partial(loc, 'enroll.webauthn.biometric.title', 'login'),
    save: _.partial(loc, 'enroll.webauthn.save', 'login'),
    noCancelButton: true,
    hasSavingState: false,
    autoSave: true,
    className: 'enroll-webauthn-form',
    noButtonBar: function() {
      return !webauthn.isNewApiAvailable();
    },
    modelEvents: {
      request: '_startEnrollment',
      error: '_stopEnrollment',
    },
    formChildren: function() {
      const children = [];

      if (webauthn.isNewApiAvailable()) {
        //enroll.webauthn.biometric.instructions.edge is unescaped because it contains html
        children.push(
          FormType.View({
            View: View.extend({
              className: 'webauthn-enroll-text',
              template: hbs(
                '\
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
              '
              ),
              getTemplateData: function() {
                return {
                  isEdge: BrowserFeatures.isEdge(),
                  onlySupportsSecurityKey: (BrowserFeatures.isFirefox() || BrowserFeatures.isSafari()) &&
                    BrowserFeatures.isMac(),
                };
              },
            }),
          })
        );
      } else {
        let errorMessageKey = 'webauthn.biometric.error.factorNotSupported';

        if (this.options.appState.get('factors').length === 1) {
          errorMessageKey = 'webauthn.biometric.error.factorNotSupported.oneFactor';
        }
        children.push(
          FormType.View(
            { View: new HtmlErrorMessageView({ message: loc(errorMessageKey, 'login') }) },
            { selector: '.o-form-error-container' }
          )
        );
      }

      return children;
    },

    _startEnrollment: function() {
      this.$('.okta-waiting-spinner').show();
      this.$('.o-form-button-bar').hide();
    },

    _stopEnrollment: function() {
      this.$('.okta-waiting-spinner').hide();
      this.$('.o-form-button-bar').show();
    },
  },

  Footer: Footer,

  trapAuthResponse: function() {
    if (this.options.appState.get('isMfaEnrollActivate')) {
      this.model.activate();
      return true;
    }
  },
});

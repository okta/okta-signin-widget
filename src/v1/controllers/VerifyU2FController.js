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

/* global u2f */
import { _, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Q from 'q';
import 'u2f-api-polyfill';
import { U2FError } from 'util/Errors';
import FactorUtil from 'util/FactorUtil';
import FidoUtil from 'util/FidoUtil';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import HtmlErrorMessageView from 'v1/views/mfa-verify/HtmlErrorMessageView';
import FooterMFA from 'v1/views/shared/FooterMFA';

function getRegisteredKeysSequence(factors) {
  const keys = [];

  _.each(factors, function(factor) {
    keys.push({
      version: factor.profile.version,
      keyHandle: factor.profile.credentialId,
    });
  });
  return keys;
}

export default FormController.extend({
  className: 'mfa-verify verify-u2f',
  Model: {
    props: {
      rememberDevice: 'boolean',
    },

    initialize: function() {
      const rememberDevice = FactorUtil.getRememberDeviceValue(this.appState);

      // set the initial value for remember device (Cannot do this while defining the
      // local property because this.settings would not be initialized there yet).
      this.set('rememberDevice', rememberDevice);
    },

    save: function() {
      this.trigger('request');

      return this.doTransaction(function(transaction) {
        let factor;

        if (transaction.factorTypes) {
          factor = _.findWhere(transaction.factorTypes, {
            factorType: 'u2f',
          });
        } else {
          factor = _.findWhere(transaction.factors, {
            factorType: 'u2f',
            provider: 'FIDO',
          });
        }
        const self = this;

        return factor.verify().then(function(transaction) {
          let registeredKeys;
          let appId;
          let nonce;

          if (transaction.factors) {
            const factors = transaction.factors;

            appId = factors[0]['profile']['appId'];
            nonce = transaction.challenge.nonce;
            registeredKeys = getRegisteredKeysSequence(factors);
          } else {
            const factorData = transaction.factor;

            appId = factorData.profile.appId;
            nonce = factorData.challenge.nonce;
            registeredKeys = [{ version: FidoUtil.getU2fVersion(), keyHandle: factorData.profile.credentialId }];
          }
          self.trigger('request');

          const deferred = Q.defer();

          u2f.sign(appId, nonce, registeredKeys, function(data) {
            self.trigger('errors:clear');
            if (data.errorCode && data.errorCode !== 0) {
              const isOneFactor = self.options.appState.get('factors').length === 1;

              deferred.reject(
                new U2FError({
                  xhr: {
                    responseJSON: {
                      errorSummary: FidoUtil.getU2fVerifyErrorMessageByCode(data.errorCode, isOneFactor),
                    },
                  },
                })
              );
            } else {
              const rememberDevice = !!self.get('rememberDevice');

              return factor
                .verify({
                  clientData: data.clientData,
                  signatureData: data.signatureData,
                  rememberDevice: rememberDevice,
                })
                .then(deferred.resolve);
            }
          });
          return deferred.promise;
        });
      })
        .catch(() => {});
    },
  },

  Form: {
    autoSave: true,
    hasSavingState: false,
    title: _.partial(loc, 'factor.u2f', 'login'),
    className: 'verify-u2f-form',
    noCancelButton: true,
    save: _.partial(loc, 'verify.u2f.retry', 'login'),
    noButtonBar: function() {
      return !FidoUtil.isU2fAvailable();
    },
    modelEvents: {
      request: '_startEnrollment',
      error: '_stopEnrollment',
    },

    formChildren: function() {
      const result = [];

      if (!FidoUtil.isU2fAvailable()) {
        let errorMessageKey = 'u2f.error.factorNotSupported';

        if (this.options.appState.get('factors').length === 1) {
          errorMessageKey = 'u2f.error.factorNotSupported.oneFactor';
        }
        result.push(
          FormType.View(
            { View: new HtmlErrorMessageView({ message: loc(errorMessageKey, 'login') }) },
            { selector: '.o-form-error-container' }
          )
        );
      } else {
        result.push(
          FormType.View({
            View: View.extend({
              template: hbs(
                '\
            <div class="u2f-verify-text">\
              <p>{{i18n code="verify.u2f.instructions" bundle="login"}}</p>\
              <p>{{i18n code="verify.u2f.instructionsBluetooth" bundle="login"}}</p>\
              <div data-se="u2f-waiting" class="okta-waiting-spinner"></div>\
            </div>'
              ),
            }),
          })
        );
      }

      if (this.options.appState.get('allowRememberDevice')) {
        result.push(
          FormType.Input({
            label: false,
            'label-top': true,
            placeholder: this.options.appState.get('rememberDeviceLabel'),
            className: 'margin-btm-0',
            name: 'rememberDevice',
            type: 'checkbox',
          })
        );
      }

      return result;
    },

    postRender: function() {
      _.defer(() => {
        if (FidoUtil.isU2fAvailable()) {
          this.model.save();
        } else {
          this.$('[data-se="u2f-waiting"]').addClass('hide');
        }
      });
    },

    _startEnrollment: function() {
      this.$('.okta-waiting-spinner').removeClass('hide');
      this.$('.o-form-button-bar').hide();
    },

    _stopEnrollment: function() {
      this.$('.okta-waiting-spinner').addClass('hide');
      this.$('.o-form-button-bar').show();
    },
  },

  back: function() {
    // Empty function on verify controllers to prevent users
    // from navigating back during 'verify' using the browser's
    // back button. The URL will still change, but the view will not
    // More details in OKTA-135060.
  },

  Footer: FooterMFA,
});

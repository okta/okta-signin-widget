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
import hbs from 'handlebars-inline-precompile';
define([
  'okta',
  'util/Errors',
  'util/FormController',
  'util/FormType',
  'views/shared/FooterSignout',
  'q',
  'util/FactorUtil',
  'util/FidoUtil',
  'views/mfa-verify/HtmlErrorMessageView',
  'u2f-api-polyfill'
],
function (Okta, Errors, FormController, FormType, FooterSignout, Q, FactorUtil, FidoUtil, HtmlErrorMessageView) {

  var _ = Okta._;

  function getRegisteredKeysSequence (factors) {
    var keys = [];
    _.each(factors, function (factor) {
      keys.push({
        version: factor.profile.version,
        keyHandle: factor.profile.credentialId
      });
    });
    return keys;
  }

  return FormController.extend({
    className: 'mfa-verify verify-u2f',
    Model: {
      props: {
        rememberDevice: 'boolean'
      },

      initialize: function () {
        var rememberDevice = FactorUtil.getRememberDeviceValue(this.appState);
        // set the initial value for remember device (Cannot do this while defining the
        // local property because this.settings would not be initialized there yet).
        this.set('rememberDevice', rememberDevice);
      },

      save: function () {
        this.trigger('request');

        return this.doTransaction(function (transaction) {
          var factor;
          if (transaction.factorTypes) {
            factor = _.findWhere(transaction.factorTypes, {
              factorType: 'u2f'
            });
          }
          else {
            factor = _.findWhere(transaction.factors, {
              factorType: 'u2f',
              provider: 'FIDO'
            });
          }
          var self = this;
          return factor.verify()
            .then(function (transaction) {
              var registeredKeys, appId, nonce;
              if (transaction.factors) {
                var factors = transaction.factors;
                appId = factors[0]['profile']['appId'];
                nonce = transaction.challenge.nonce;
                registeredKeys = getRegisteredKeysSequence(factors);
              }
              else {
                var factorData = transaction.factor;
                appId = factorData.profile.appId;
                nonce = factorData.challenge.nonce;
                registeredKeys = [{version: FidoUtil.getU2fVersion(), keyHandle: factorData.profile.credentialId }];
              }
              self.trigger('request');

              var deferred = Q.defer();
              u2f.sign(appId, nonce, registeredKeys, function (data) {
                self.trigger('errors:clear');
                if (data.errorCode && data.errorCode !== 0) {
                  var isOneFactor = self.options.appState.get('factors').length === 1;
                  deferred.reject(
                    new Errors.U2FError({
                      xhr: {
                        responseJSON: {
                          errorSummary: FidoUtil.getU2fVerifyErrorMessageByCode(data.errorCode, isOneFactor)
                        }
                      }
                    })
                  );
                } else {
                  var rememberDevice = !!self.get('rememberDevice');
                  return factor.verify({
                    clientData: data.clientData,
                    signatureData: data.signatureData,
                    rememberDevice: rememberDevice
                  })
                    .then(deferred.resolve);
                }
              });
              return deferred.promise;
            });
        });
      }
    },

    Form: {
      autoSave: true,
      hasSavingState: false,
      title: _.partial(Okta.loc, 'factor.u2f', 'login'),
      className: 'verify-u2f-form',
      noCancelButton: true,
      save: _.partial(Okta.loc, 'verify.u2f.retry', 'login'),
      noButtonBar: function () {
        return !FidoUtil.isU2fAvailable();
      },
      modelEvents: {
        'request': '_startEnrollment',
        'error': '_stopEnrollment'
      },

      formChildren: function () {
        var result = [];

        if (!FidoUtil.isU2fAvailable()) {
          var errorMessageKey = 'u2f.error.factorNotSupported';
          if (this.options.appState.get('factors').length === 1) {
            errorMessageKey = 'u2f.error.factorNotSupported.oneFactor';
          }
          result.push(FormType.View(
            {View: new HtmlErrorMessageView({message: Okta.loc(errorMessageKey, 'login')})},
            {selector: '.o-form-error-container'}
          ));
        }
        else {
          result.push(FormType.View({
            View: Okta.View.extend({
              template: hbs('\
            <div class="u2f-verify-text">\
              <p>{{i18n code="verify.u2f.instructions" bundle="login"}}</p>\
              <p>{{i18n code="verify.u2f.instructionsBluetooth" bundle="login"}}</p>\
              <div data-se="u2f-waiting" class="okta-waiting-spinner"></div>\
            </div>')
            })
          }));
        }

        if (this.options.appState.get('allowRememberDevice')) {
          result.push(FormType.Input({
            label: false,
            'label-top': true,
            placeholder: this.options.appState.get('rememberDeviceLabel'),
            className: 'margin-btm-0',
            name: 'rememberDevice',
            type: 'checkbox'
          }));
        }

        return result;
      },

      postRender: function () {
        _.defer(_.bind(function () {
          if (FidoUtil.isU2fAvailable()) {
            this.model.save();
          }
          else {
            this.$('[data-se="u2f-waiting"]').addClass('hide');
          }
        }, this));
      },

      _startEnrollment: function () {
        this.$('.okta-waiting-spinner').removeClass('hide');
        this.$('.o-form-button-bar').hide();
      },

      _stopEnrollment: function () {
        this.$('.okta-waiting-spinner').addClass('hide');
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

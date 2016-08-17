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

/*global u2f */

define([
  'okta',
  'util/FormController',
  'util/FormType',
  'views/shared/FooterSignout',
  'vendor/lib/q',
  'u2f-api-polyfill'
],
function (Okta, FormController, FormType, FooterSignout, Q) {

  var _ = Okta._;

  return FormController.extend({
    className: 'verify-u2f',
    Model: {
      save: function () {
        this.trigger('request');

        return this.doTransaction(function (transaction) {
          var factor = _.findWhere(transaction.factors, {
            factorType: 'u2f',
            provider: 'FIDO'
          });
          var self = this;
          return factor.verify()
          .then(function (transaction) {
            var factorData = transaction.factor;
            var appId = factorData.profile.appId;
            var registeredKeys = [{version: factorData.profile.version, keyHandle: factorData.profile.credentialId }];
            self.trigger('request');

            var deferred = Q.defer();
            u2f.sign(appId, factorData.challenge.nonce, registeredKeys, function (data) {
              self.trigger('errors:clear');
              if (data.errorCode && data.errorCode !== 0) {
                deferred.reject({ responseJSON: {errorSummary: 'Error Code: ' + data.errorCode}});
              } else {
                return factor.verify({
                  clientData: data.clientData,
                  signatureData: data.signatureData
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
      title: Okta.loc('factor.u2f', 'login'),
      className: 'verify-u2f-form',
      noCancelButton: true,
      save: Okta.loc('verify.u2f.retry', 'login'),
      modelEvents: {
        'error': '_showRetry',
        'request': '_hideRetry'
      },

      formChildren: [
        FormType.View({
          View: '\
            <div class="u2f-verify-text">\
              <p>{{i18n code="verify.u2f.instructions" bundle="login"}}</p>\
              <p>{{i18n code="verify.u2f.instructionsBluetooth" bundle="login"}}</p>\
              <div data-se="u2f-waiting" class="okta-waiting-spinner"></div>\
            </div>'
        })
      ],

      postRender: function () {
        this.model.save();
      },

      _showRetry: function () {
        this.$('.okta-waiting-spinner').addClass('hide');
        this.$('.o-form-button-bar').show();
      },

      _hideRetry: function () {
        this.$('.okta-waiting-spinner').removeClass('hide');
        this.$('.o-form-button-bar').hide();
      }
    },

    Footer: FooterSignout
  });

});

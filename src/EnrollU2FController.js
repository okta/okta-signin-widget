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
  'util/FormType',
  'util/FormController',
  'util/FidoUtil',
  'views/enroll-factors/Footer',
  'q',
  'views/mfa-verify/HtmlErrorMessageView',
  'u2f-api-polyfill'
],
function (Okta, Errors, FormType, FormController, FidoUtil, Footer, Q, HtmlErrorMessageView) {

  var _ = Okta._;

  return FormController.extend({
    className: 'enroll-u2f',
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
            factorType: 'u2f',
            provider: 'FIDO'
          });
          return factor.enroll();
        });
      },

      activate: function () {
        this.set('__enrolled__', true);
        this.trigger('errors:clear');

        return this.doTransaction(function (transaction) {
          var activation = transaction.factor.activation;
          var appId = activation.appId;
          var registerRequests = [{
            version: FidoUtil.getU2fVersion(),
            challenge: activation.nonce
          }];
          var self = this;
          var deferred = Q.defer();
          u2f.register(appId, registerRequests, [], function (data) {
            self.trigger('errors:clear');
            if (data.errorCode && data.errorCode !== 0) {
              deferred.reject(
                new Errors.U2FError({
                  xhr: {
                    responseJSON: {
                      errorSummary: FidoUtil.getU2fEnrollErrorMessageByCode(data.errorCode)
                    }
                  }
                })
              );
            } else {
              deferred.resolve(transaction.activate({
                registrationData: data.registrationData,
                version: data.version,
                challenge: data.challenge,
                clientData: data.clientData
              }));
            }
          });
          return deferred.promise;
        });
      }
    },

    Form: {
      title: _.partial(Okta.loc, 'enroll.u2f.title', 'login'),
      save: _.partial(Okta.loc, 'enroll.u2f.save', 'login'),
      noCancelButton: true,
      hasSavingState: false,
      autoSave: true,
      className: 'enroll-u2f-form',
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
          //There is html in enroll.u2f.general2 in our properties file, reason why is unescaped
          result.push(FormType.View({
            View: Okta.View.extend({
              template: hbs('<div class="u2f-instructions"><ol>\
                <li>{{{i18n code="enroll.u2f.general2" bundle="login"}}}</li>\
                <li>{{i18n code="enroll.u2f.general3" bundle="login"}}</li>\
                </ol></div>'
              )
            })
          }));

          result.push(FormType.View({
            View: Okta.View.extend({
              template: hbs('\
                <div class="u2f-enroll-text hide">\
                  <p>{{i18n code="enroll.u2f.instructions" bundle="login"}}</p>\
                  <p>{{i18n code="enroll.u2f.instructionsBluetooth" bundle="login"}}</p>\
                  <div data-se="u2f-devices" class="u2f-devices-images">\
                    <div class="u2f-usb"></div>\
                    <div class="u2f-bluetooth"></div>\
                  </div>\
                  <div data-se="u2f-waiting" class="okta-waiting-spinner"></div>\
                </div>'
              )
            })
          }));
        }

        return result;
      },

      _startEnrollment: function () {
        this.$('.u2f-instructions').addClass('hide');
        this.$('.u2f-enroll-text').removeClass('hide');
        this.$('.o-form-button-bar').hide();
      },

      _stopEnrollment: function () {
        this.$('.u2f-instructions').removeClass('hide');
        this.$('.u2f-enroll-text').addClass('hide');
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

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
  'util/FormController',
  'util/FormType',
  'util/webauthn',
  'views/enroll-factors/Footer',
  'views/mfa-verify/WindowsHelloErrorMessageView'
],
function (Okta, FormController, FormType, webauthn, Footer, WindowsHelloErrorMessageView) {

  var _ = Okta._;

  return FormController.extend({
    className: 'enroll-windows-hello',
    Model: {
      local: {
        __isEnrolled__: 'boolean'
      },

      save: function () {
        if (!webauthn.isAvailable()) {
          return;
        }

        this.trigger('request');

        if (this.get('__isEnrolled__')) {
          return this.activate();
        }

        return this.doTransaction(function (transaction) {
          return this._enroll(transaction);
        });
      },

      _enroll: function (transaction) {
        var factor = _.findWhere(transaction.factors, {
          factorType: 'webauthn',
          provider: 'FIDO'
        });

        return factor.enroll();
      },

      activate: function () {
        this.set('__isEnrolled__', true);

        return this.doTransaction(function (transaction) {
          var activation = transaction.factor.activation;
          var user = transaction.user;

          var accountInfo = {
            rpDisplayName: activation.rpDisplayName,
            userDisplayName: user.profile.displayName,
            accountName: user.profile.login,
            userId: user.id
          };
          var cryptoParams = [{
            algorithm: activation.algorithm
          }];
          var challenge = activation.nonce;

          return webauthn.makeCredential(accountInfo, cryptoParams, challenge)
          .then(function (creds) {
            return transaction.activate({
              credentialId: creds.credential.id,
              publicKey: creds.publicKey,
              attestation: null
            });
          });
        });
      }
    },

    Form: {
      autoSave: true,
      hasSavingState: true,
      title: Okta.loc('enroll.windowsHello.title', 'login'),
      subtitle: function () {
        return webauthn.isAvailable() ? Okta.loc('enroll.windowsHello.subtitle', 'login') : '';
      },
      save: Okta.loc('enroll.windowsHello.save', 'login'),

      modelEvents: function () {
        if (!webauthn.isAvailable()) {
          return {};
        }

        return {
          'request': '_startEnrollment',
          'error': '_stopEnrollment'
        };
      },

      noButtonBar: function () {
        return !webauthn.isAvailable();
      },

      formChildren: function () {
        var result = [];
        if (!webauthn.isAvailable()) {
          result.push(
            FormType.View(
              { View: WindowsHelloErrorMessageView },
              { selector: '.o-form-error-container' }
            )
          );
        }
        return result;
      },

      _startEnrollment: function () {
        this.subtitle = Okta.loc('enroll.windowsHello.subtitle.loading', 'login');
        this.render();
      },

      _stopEnrollment: function () {
        this.subtitle = Okta.loc('enroll.windowsHello.subtitle', 'login');
        this.render();
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

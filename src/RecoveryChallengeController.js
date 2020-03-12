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

import hbs from 'handlebars-inline-precompile';
define([
  'okta',
  'util/FormController',
  'util/FormType',
  'util/Enums',
  'views/shared/FooterSignout',
  'views/shared/TextBox'
],
function (Okta, FormController, FormType, Enums, FooterSignout, TextBox) {

  var _ = Okta._;

  return FormController.extend({
    className: 'recovery-challenge',
    Model: {
      props: {
        passCode: ['string', true]
      },
      local: {
        ableToResend: 'boolean'
      },
      resendCode: function () {
        // Note: This does not require a trapAuthResponse because Backbone's
        // router will not navigate if the url path is the same
        this.limitResending();
        return this.doTransaction(function (transaction) {
          return transaction.resend();
        });
      },
      limitResending: function () {
        this.set({ableToResend: false});
        _.delay(_.bind(this.set, this), Enums.API_RATE_LIMIT, {ableToResend: true});
      },
      save: function () {
        return this.doTransaction(function (transaction) {
          return transaction.verify({
            passCode: this.get('passCode')
          });
        });
      }
    },
    Form: {
      autoSave: true,
      save: _.partial(Okta.loc, 'mfa.challenge.verify', 'login'),
      title: function () {
        if (this.options.appState.get('factorType') === Enums.RECOVERY_FACTOR_TYPE_CALL) {
          return Okta.loc('recoveryChallenge.call.title', 'login');
        } else {
          return Okta.loc('recoveryChallenge.sms.title', 'login');
        }
      },
      className: 'recovery-challenge',
      initialize: function () {
        this.listenTo(this.model, 'error', function () {
          this.clearErrors();
        });
      },
      formChildren: function () {
        return [
          FormType.Button({
            title: Okta.loc('mfa.resendCode', 'login'),
            attributes: { 'data-se': 'resend-button' },
            className: 'button sms-request-button margin-top-30',
            click: function () {
              this.model.resendCode();
            },
            initialize: function () {
              this.listenTo(this.model, 'change:ableToResend', function (model, ableToResend) {
                if (ableToResend) {
                  this.options.title = Okta.loc('mfa.resendCode', 'login');
                  this.enable();
                  this.render();
                } else {
                  this.options.title = Okta.loc('mfa.sent', 'login');
                  this.disable();
                  this.render();
                }
              });
            }
          }),
          FormType.Input({
            label: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
            'label-top': true,
            className: 'enroll-sms-phone',
            name: 'passCode',
            input: TextBox,
            type: 'text'
          })
        ];
      }
    },

    events: {
      'click .send-email-link': function (e) {
        e.preventDefault();
        var settings = this.model.settings,
            username = this.options.appState.get('username'),
            recoveryType = this.options.appState.get('recoveryType');

        this.model.startTransaction(function (authClient) {
          // The user could have landed here via the Forgot Password/Unlock Account flow
          switch (recoveryType) {
          case Enums.RECOVERY_TYPE_PASSWORD:
            return authClient.forgotPassword({
              username: settings.transformUsername(username, Enums.FORGOT_PASSWORD),
              factorType: Enums.RECOVERY_FACTOR_TYPE_EMAIL
            });
          case Enums.RECOVERY_TYPE_UNLOCK:
            return authClient.unlockAccount({
              username: settings.transformUsername(username, Enums.UNLOCK_ACCOUNT),
              factorType: Enums.RECOVERY_FACTOR_TYPE_EMAIL
            });
          default:
            return;
          }
        });
      }
    },

    initialize: function () {
      var recoveryType = this.options.appState.get('recoveryType'),
          sendEmailLink;

      switch (recoveryType) {
      case Enums.RECOVERY_TYPE_PASSWORD:
        sendEmailLink = hbs('\
          <a href="#" class="link send-email-link" data-se="send-email-link">\
            {{i18n code="password.forgot.code.notReceived" bundle="login"}}\
          </a>');
        break;
      case Enums.RECOVERY_TYPE_UNLOCK:
        sendEmailLink = hbs('\
          <a href="#" class="link send-email-link" data-se="send-email-link">\
            {{i18n code="account.unlock.code.notReceived" bundle="login"}}\
          </a>');
        break;
      default:
        break;
      }

      if (sendEmailLink && this.settings.get('features.emailRecovery')) {
        this.add(Okta.View.extend({
          template: sendEmailLink
        }));
      }

      if (!this.settings.get('features.hideBackToSignInForReset')) {
        this.add(
          new FooterSignout(_.extend(this.toJSON(), {linkText: Okta.loc('goback', 'login'), linkClassName: ''}))
        );
      }
    },

    postRender: function () {
      this.model.limitResending();
    }

  });

});

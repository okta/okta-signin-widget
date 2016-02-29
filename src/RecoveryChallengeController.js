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
  'util/FormController',
  'util/FormType',
  'views/shared/FooterSignout'
],
function (Okta, FormController, FormType, FooterSignout) {

  var _ = Okta._;
  var API_RATE_LIMIT = 30000; //milliseconds

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
        return this.doTransaction(function(transaction) {
          var firstLink = transaction.response._links.resend;
          return transaction.resendByName(firstLink.name);
        });
      },
      limitResending: function () {
        this.set({ableToResend: false});
        _.delay(_.bind(this.set, this), API_RATE_LIMIT, {ableToResend: true});
      },
      save: function () {
        return this.doTransaction(function(transaction) {
          return transaction
          .verifyRecovery({
            passCode: this.get('passCode')
          });
        });
      }
    },
    Form: {
      autoSave: true,
      save: Okta.loc('mfa.challenge.verify', 'login'),
      title: Okta.loc('recoveryChallenge.sms.title', 'login'),
      className: 'recovery-challenge',
      initialize: function () {
        this.listenTo(this.model, 'error', function () {
          this.clearErrors();
        });
      },
      formChildren: [
        FormType.Button({
          title: Okta.loc('mfa.resendCode', 'login'),
          attributes: { 'data-se': 'resend-button' },
          className: 'button sms-request-button',
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
          placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
          className: 'enroll-sms-phone',
          name: 'passCode',
          type: 'text'
        })
      ]
    },

    initialize: function () {
      this.add(new FooterSignout(_.extend(this.toJSON(), {linkText: Okta.loc('goback', 'login'), linkClassName: ''})));
    },

    postRender: function () {
      this.model.limitResending();
    }

  });

});

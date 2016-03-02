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

define(['okta', 'vendor/lib/q'], function (Okta, Q) {

  var subtitleTpl = Okta.Handlebars.compile('({{phoneNumber}})');
  var _ = Okta._;
  var API_RATE_LIMIT = 30000; //milliseconds

  return Okta.Form.extend({
    className: 'mfa-verify-sms',
    autoSave: true,
    noCancelButton: true,
    save: Okta.loc('mfa.challenge.verify', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-sms' },

    disableSubmitButton: function () {
      return this.model.appState.get('isMfaChallenge');
    },

    initialize: function () {
      var self = this;
      this.title = this.model.get('factorLabel');
      this.subtitle = subtitleTpl({
        phoneNumber: this.model.get('phoneNumber')
      });
      this.listenTo(this.model, 'error', function () {
        this.clearErrors();
      });
      this.add(Okta.createButton({
        attributes: { 'data-se': 'sms-send-code' },
        className: 'button sms-request-button',
        title: Okta.loc('mfa.sendCode', 'login'),
        click: function () {
          self.clearErrors();
          // To send an OTP to the device, make the same request but use
          // an empty passCode
          this.model.set('answer', '');
          this.model.save()
          .then(_.bind(function () {
            this.options.title = Okta.loc('mfa.sent', 'login');
            this.disable();
            this.render();
            // render and focus on the passcode input field.
            self.getInputs().first().render().focus();
            return Q.delay(API_RATE_LIMIT);
          }, this))
          .then(_.bind(function () {
            this.options.title = Okta.loc('mfa.resendCode', 'login');
            this.enable();
            this.render();
          }, this));
        }
      }));
      this.addInput({
        label: false,
        'label-top': true,
        placeholder: Okta.loc('mfa.challenge.enterCode.placeholder', 'login'),
        className: 'o-form-fieldset o-form-label-top auth-passcode',
        name: 'answer',
        type: 'text'
      });
    }

  });

});

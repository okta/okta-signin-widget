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

/*jshint maxcomplexity:9 */
define([
  'okta',
  'util/BaseLoginController',
  'views/mfa-verify/TOTPForm',
  'views/mfa-verify/YubikeyForm',
  'views/mfa-verify/SecurityQuestionForm',
  'views/mfa-verify/SMSForm',
  'views/mfa-verify/PushForm',
  'views/mfa-verify/InlineTOTPForm',
  'views/shared/FooterSignout'
],
function (Okta, BaseLoginController, TOTPForm, YubikeyForm, SecurityQuestionForm, SMSForm,
          PushForm, InlineTOTPForm, FooterSignout) {

  return BaseLoginController.extend({
    className: 'mfa-verify',

    initialize: function (options) {
      var factors = options.appState.get('factors');
      var factorType = options.factorType;
      var provider = options.provider;

      var View;
      switch (factorType) {
      case 'question':
        View = SecurityQuestionForm;
        break;
      case 'sms':
        View = SMSForm;
        break;
      case 'token':
      case 'token:software:totp':
        View = TOTPForm;
        break;
      case 'token:hardware':
        View = YubikeyForm;
        break;
      case 'push':
        View = PushForm;
        break;
      default:
        throw new Error('Unrecognized factor type');
      }

      this.model = factors.findWhere({ provider: provider, factorType: factorType });
      if (!this.model) {
        // TODO: recover from this more gracefully - probably to redirect
        // to default factor
        throw new Error('Unrecognized factor/provider');
      }

      this.addListeners();
      this.add(new View(this.toJSON()));

      // Okta Push is different from the other factors - it has a backup
      // totp factor that can be chosen with the InlineTOTPForm
      if (factorType === 'push' && this.model.get('isOktaFactor')) {
        this.add(InlineTOTPForm, {
          options: { model: this.model.get('backupFactor') }
        });
      }

      this.add(new FooterSignout(this.toJSON()));
    },

    trapAuthResponse: function () {
      if (this.options.appState.get('isMfaChallenge') ||
          this.options.appState.get('isMfaRequired')) {
        return true;
      }
    }
  });

});

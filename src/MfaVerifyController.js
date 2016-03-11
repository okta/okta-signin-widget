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

/* eslint complexity: [2, 9] */
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

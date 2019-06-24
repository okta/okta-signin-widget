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

/* eslint complexity: [2, 21] max-statements: [2, 25] max-params: [2, 12]*/
define([
  'okta',
  'util/BaseLoginController',
  'views/mfa-verify/TOTPForm',
  'views/mfa-verify/YubikeyForm',
  'views/mfa-verify/SecurityQuestionForm',
  'views/mfa-verify/PassCodeForm',
  'views/factor-verify/EmailMagicLinkForm',
  'views/mfa-verify/PushForm',
  'views/mfa-verify/PasswordForm',
  'views/mfa-verify/InlineTOTPForm',
  'views/shared/FooterSignout'
],
function (Okta, BaseLoginController, TOTPForm, YubikeyForm, SecurityQuestionForm, PassCodeForm,
  EmailMagicLinkForm, PushForm, PasswordForm, InlineTOTPForm, FooterSignout) {

  var { CheckBox } = Okta.internal.views.forms.inputs;

  return BaseLoginController.extend({
    className: 'mfa-verify',

    initialize: function (options) {
      var factorType = options.factorType;

      var View;
      switch (factorType) {
      case 'question':
        View = SecurityQuestionForm;
        break;
      case 'email':
        if (this.options.appState.get('isIdxStateToken')){
          View = EmailMagicLinkForm;
        } else {
          View = PassCodeForm;
        }
        break;
      case 'sms':
      case 'call':
        View = PassCodeForm;
        break;
      case 'token':
      case 'token:software:totp':
      case 'token:hotp':
        View = TOTPForm;
        break;
      case 'token:hardware':
        View = YubikeyForm;
        break;
      case 'push':
        View = PushForm;
        break;
      case 'password':
        View = PasswordForm;
        break;
      default:
        throw new Error('Unrecognized factor type');
      }

      this.model = this.findModel(factorType, options);
      if (!this.model) {
        // TODO: recover from this more gracefully - probably to redirect
        // to default factor
        throw new Error('Unrecognized factor/provider');
      }

      this.addListeners();
      this.add(new View(this.toJSON()));

      // If Okta Verify Push and Okta Verify totp are both enabled,
      // then we show Push first, and totp is the "backup" factor,
      // which is rendered in an additional InlineTOTPForm
      if (factorType === 'push' && this.model.get('isOktaFactor')) {
        if (this.model.get('backupFactor')) {
          this.add(InlineTOTPForm, {
            options: { model: this.model.get('backupFactor') }
          });
        }

        if (this.settings.get('features.autoPush')) {
          this.add(CheckBox, {
            options: {
              model: this.model,
              name: 'autoPush',
              placeholder: Okta.loc('autoPush', 'login'),
              label: false,
              'label-top': false,
              className: 'margin-btm-0'
            }
          });
        }

        // Remember Device checkbox resides outside of the Push and TOTP forms.
        if (this.options.appState.get('allowRememberDevice')) {
          this.add(CheckBox, {
            options: {
              model: this.model,
              name: 'rememberDevice',
              placeholder: this.options.appState.get('rememberDeviceLabel'),
              label: false,
              'label-top': true,
              className: 'margin-btm-0'
            }
          });
        }
        // Set rememberDevice on the backup factor (totp) if available
        if (this.model.get('backupFactor')) {
          this.listenTo(this.model, 'change:rememberDevice', function (model, rememberDevice) {
            model.get('backupFactor').set('rememberDevice', rememberDevice);
          });
        }
      }

      if (!this.settings.get('features.hideSignOutLinkInMFA')) {
        this.add(new FooterSignout(this.toJSON()));
      }
    },

    findModel: function (factorType, options) {
      var factors = options.appState.get('factors');
      var provider = options.provider;
      var factorIndex = options.factorIndex;

      if (!provider) {
        return factors.findWhere({ factorType: factorType, isFactorTypeVerification: true });
      } else if (factors.hasMultipleFactorsOfSameType(factorType) && factorIndex) {
        return factors.getFactorByTypeAndIndex(factorType, factorIndex);
      } else {
        return factors.findWhere({ provider: provider, factorType: factorType });
      }
    },

    trapAuthResponse: function () {
      if((this.options.appState.get('isMfaRequired') &&
          this.options.appState.get('trapMfaRequiredResponse')) ||
          this.options.appState.get('isMfaChallenge')) {
        this.options.appState.set('trapMfaRequiredResponse', false);
        return true;
      }
      return false;
    },

    back: function () {
      // Empty function on verify controllers to prevent users
      // from navigating back during 'verify' using the browser's
      // back button. The URL will still change, but the view will not
      // More details in OKTA-135060.
    }
  });

});

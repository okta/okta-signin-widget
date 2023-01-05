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

/* eslint complexity: [2, 21] max-statements: [2, 25] max-params: 0 */
import { loc, internal } from '@okta/courage';
import BaseLoginController from 'v1/util/BaseLoginController';
import EmailMagicLinkForm from 'v1/views/factor-verify/EmailMagicLinkForm';
import InlineTOTPForm from 'v1/views/mfa-verify/InlineTOTPForm';
import PassCodeForm from 'v1/views/mfa-verify/PassCodeForm';
import PasswordForm from 'v1/views/mfa-verify/PasswordForm';
import PushForm from 'v1/views/mfa-verify/PushForm';
import SecurityQuestionForm from 'v1/views/mfa-verify/SecurityQuestionForm';
import SendEmailAndVerifyCodeForm from 'v1/views/mfa-verify/SendEmailAndVerifyCodeForm';
import TOTPForm from 'v1/views/mfa-verify/TOTPForm';
import YubikeyForm from 'v1/views/mfa-verify/YubikeyForm';
import FooterMFA from 'v1/views/shared/FooterMFA';
let { CheckBox } = internal.views.forms.inputs;
export default BaseLoginController.extend({
  className: 'mfa-verify',

  initialize: function(options) {
    const factorType = options.factorType;
    let View;

    switch (factorType) {
    case 'question':
      View = SecurityQuestionForm;
      break;
    case 'email':
      if (this.options.appState.get('isIdxStateToken')) {
        View = EmailMagicLinkForm;
      } else {
        View = SendEmailAndVerifyCodeForm;
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
        this.inlineTotpForm = this.add(InlineTOTPForm, {
          options: { model: this.model.get('backupFactor') },
        }).last();
      }

      if (this.settings.get('features.autoPush')) {
        this.autoPushCheckBox = this.add(CheckBox, {
          options: {
            model: this.model,
            name: 'autoPush',
            placeholder: loc('autoPush', 'login'),
            label: false,
            'label-top': false,
            className: 'margin-btm-0',
          },
        }).last();
      }

      // Remember Device checkbox resides outside of the Push and TOTP forms.
      if (this.options.appState.get('allowRememberDevice')) {
        this.rememberDeviceCheckbox = this.add(CheckBox, {
          options: {
            model: this.model,
            name: 'rememberDevice',
            placeholder: this.options.appState.get('rememberDeviceLabel'),
            label: false,
            'label-top': true,
            className: 'margin-btm-0',
          },
        }).last();
      }
      // Set rememberDevice on the backup factor (totp) if available
      if (this.model.get('backupFactor')) {
        this.listenTo(this.model, 'change:rememberDevice', function(model, rememberDevice) {
          model.get('backupFactor').set('rememberDevice', rememberDevice);
        });
      }
    }

    this.listenTo(this.options.appState, 'change:isWaitingForNumberChallenge', function(
      state,
      isWaitingForNumberChallenge
    ) {
      if (isWaitingForNumberChallenge || this.options.appState.get('lastAuthResponse').status === 'SUCCESS') {
        this.autoPushCheckBox && this.autoPushCheckBox.$el.hide();
        this.rememberDeviceCheckbox && this.rememberDeviceCheckbox.$el.hide();
        this.inlineTotpForm && this.inlineTotpForm.$el.hide();
      } else {
        this.autoPushCheckBox && this.autoPushCheckBox.$el.show();
        this.rememberDeviceCheckbox && this.rememberDeviceCheckbox.$el.show();
        this.inlineTotpForm && this.inlineTotpForm.$el.show();
      }
    });

    this.add(new FooterMFA(this.toJSON()));
  },

  findModel: function(factorType, options) {
    const factors = options.appState.get('factors');
    const provider = options.provider;
    const factorIndex = options.factorIndex;

    if (!provider) {
      return factors.findWhere({ factorType: factorType, isFactorTypeVerification: true });
    } else if (factors.hasMultipleFactorsOfSameType(factorType) && factorIndex) {
      return factors.getFactorByTypeAndIndex(factorType, factorIndex);
    } else {
      return factors.findWhere({ provider: provider, factorType: factorType });
    }
  },

  trapAuthResponse: function() {
    if (
      (this.options.appState.get('isMfaRequired') && this.options.appState.get('trapMfaRequiredResponse')) ||
      this.options.appState.get('isMfaChallenge')
    ) {
      this.options.appState.set('trapMfaRequiredResponse', false);
      return true;
    }
    return false;
  },

  back: function() {
    // Empty function on verify controllers to prevent users
    // from navigating back during 'verify' using the browser's
    // back button. The URL will still change, but the view will not
    // More details in OKTA-135060.
  },
});

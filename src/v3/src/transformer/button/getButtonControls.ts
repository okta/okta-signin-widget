/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  IdxTransaction,
  NextStep,
} from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  LinkElement,
  UISchemaElement,
  UISchemaLayoutType,
  WidgetProps,
} from '../../types';
import { loc, shouldShowCancelLink } from '../../util';

interface GetButtonControls {
  elements: UISchemaElement[];
}

interface GetButtonControlsArgs {
  stepWithSubmit?: boolean;
  stepWithCancel?: boolean;
  stepWithRegister?: boolean;
  stepWithForgotPassword?: boolean;
  stepWithSignInWithFastPass?: boolean;
  stepWithUnlockAccount?: boolean;
  verifyWithOther?: boolean;
  backToAuthList?: boolean;
  widgetProps?: WidgetProps;
}

export const getButtonControls = (
  transaction: IdxTransaction,
  config: GetButtonControlsArgs,
): GetButtonControls => {
  const elements = [];

  const getButtonStep = (stepName: string): NextStep | undefined => transaction.availableSteps
    ?.find(({ name }) => name === stepName);

  if (config.stepWithSubmit) {
    const submit: ButtonElement = {
      type: 'Button',
      label: loc('oform.next', 'login'),
      options: {
        type: ButtonType.SUBMIT,
        step: transaction.nextStep!.name,
      },
    };

    elements.push(submit);
  }

  // TODO: Extract this name to a constant
  const forgotPasswordStep = getButtonStep('currentAuthenticator-recover')
    ?? getButtonStep('currentAuthenticatorEnrollment-recover');
  if (config.stepWithForgotPassword && forgotPasswordStep) {
    const { name: step } = forgotPasswordStep;
    const forgotPassword: LinkElement = {
      type: 'Link',
      options: {
        label: loc('forgotpassword', 'login'),
        isActionStep: true,
        step,
      },
    };

    elements.push(forgotPassword);
  }

  // TODO: Extract this name to a constant
  const fastpassStep = getButtonStep('launch-authenticator');
  if (config.stepWithSignInWithFastPass && fastpassStep) {
    const { name: step } = fastpassStep;

    const fastPass: ButtonElement = {
      type: 'Button',
      label: loc('oktaVerify.button', 'login'),
      options: {
        type: ButtonType.BUTTON,
        // TODO when adding fastpass support.
        // hook up the actual URL from device challenge remediation object in
        // remedation array. The target URL is driven by the API response directly.
        // @see: https://github.com/okta/okta-signin-widget/blob/8a115ae645c6f541b5bb921fd15d0099443de8b6/src/v2/view-builder/views/signin/SignInWithDeviceOption.js#L29-L42
        deviceChallengeUrl: 'http://www.okta.com',
        step,
      },
    };

    elements.push(fastPass);
  }

  const unlockStep = transaction.availableSteps?.find(
    ({ name }) => name === 'unlock-account',
  );
  if (config.stepWithUnlockAccount && unlockStep) {
    const { name: step } = unlockStep;
    const unlock: LinkElement = {
      type: 'Link',
      options: {
        label: loc('unlockaccount', 'login'),
        step,
      },
    };

    elements.push(unlock);
  }

  const selectVerifyStep = getButtonStep(IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
  if (config.verifyWithOther && selectVerifyStep) {
    const { name: step } = selectVerifyStep;
    elements.push({
      type: 'Link',
      options: {
        label: loc('oie.verification.switch.authenticator', 'login'),
        step,
      },
    } as LinkElement);
  }

  const selectEnrollStep = getButtonStep(IDX_STEP.SELECT_AUTHENTICATOR_ENROLL);
  if (config.backToAuthList && selectEnrollStep) {
    const { name: step } = selectEnrollStep;
    elements.push({
      type: 'Link',
      options: {
        label: loc('oie.enroll.switch.authenticator', 'login'),
        step,
      },
    } as LinkElement);
  }

  const registerStep = getButtonStep(IDX_STEP.SELECT_ENROLL_PROFILE);
  if (config.stepWithRegister && registerStep) {
    const { registration } = config.widgetProps || {};
    elements.push({
      type: 'Divider',
    });
    const { name: step } = registerStep;
    const registerLink: LinkElement = {
      type: 'Link',
      options: {
        label: loc('signup', 'login'),
        step,
      },
    };
    if (typeof registration?.click === 'function') {
      registerLink.options.onClick = registration?.click;
    }
    const registrationLabel: DescriptionElement = {
      type: 'Description',
      options: {
        content: loc('registration.signup.label', 'login'),
      },
    };
    const registerEntryLayout = {
      type: UISchemaLayoutType.HORIZONTAL,
      elements: [registrationLabel, registerLink],
    };

    elements.push(registerEntryLayout);
  }

  const cancelStep = getButtonStep('cancel');
  if (config.stepWithCancel && cancelStep && shouldShowCancelLink(config.widgetProps?.features)) {
    const { name: step } = cancelStep;
    const cancel: LinkElement = {
      type: 'Link',
      options: {
        label: loc('goback', 'login'),
        isActionStep: true,
        step,
      },
    };

    elements.push(cancel);
  }

  return { elements };
};

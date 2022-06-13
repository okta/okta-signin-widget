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

import { ControlElement, JsonSchema7 } from '@jsonforms/core';
import { NextStep } from '@okta/okta-auth-js';

import { IDX_STEP } from '../constants';
import { IdxTransactionWithNextStep, Undefinable } from '../types';

interface GetButtonControls {
  elements: ControlElement[];
  properties: {
    [property: string]: JsonSchema7;
  };
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
}

export enum ButtonOptionType {
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgotPassword',
  SIGN_IN_WITH_FASTPASS = 'signInWithFastPass',
  UNLOCK_ACCOUNT = 'unlock-account',
  CHANGE_AUTHENTICATOR = 'changeAuthenticator',
}

export const getButtonControls = (
  transaction: IdxTransactionWithNextStep,
  config: GetButtonControlsArgs,
): GetButtonControls => {
  const elements = [];
  const properties: JsonSchema7['properties'] = {};

  const getButtonStep = (stepName: string): Undefinable<NextStep> => transaction.availableSteps
    ?.find(({ name }) => name === stepName);

  if (config.stepWithSubmit) {
    const submit: ControlElement = {
      type: 'Control',
      label: 'oie.registration.form.update.submit',
      scope: `#/properties/${ButtonOptionType.SUBMIT}`,
      options: {
        format: 'button',
        type: ButtonOptionType.SUBMIT,
      },
    };

    elements.push(submit);
  }

  const registerStep = getButtonStep(IDX_STEP.SELECT_ENROLL_PROFILE);
  if (config.stepWithRegister && registerStep) {
    const { action } = registerStep;
    const register: ControlElement = {
      type: 'Control',
      label: 'registration.form.submit',
      scope: `#/properties/${ButtonOptionType.REGISTER}`,
      options: {
        format: 'button',
        type: ButtonOptionType.REGISTER,
        variant: 'secondary',
        action,
      },
    };

    elements.push(register);
  }

  // TODO: Extract this name to a constant
  const forgotPasswordStep = getButtonStep('currentAuthenticator-recover');
  if (config.stepWithForgotPassword && forgotPasswordStep) {
    const { action } = forgotPasswordStep;
    const forgotPassword: ControlElement = {
      type: 'Control',
      label: 'forgotpassword',
      scope: `#/properties/${ButtonOptionType.FORGOT_PASSWORD}`,
      options: {
        format: 'button',
        type: ButtonOptionType.FORGOT_PASSWORD,
        variant: 'secondary',
        action,
      },
    };

    elements.push(forgotPassword);
  }

  // TODO: Extract this name to a constant
  const fastpassStep = getButtonStep('launch-authenticator');
  if (config.stepWithSignInWithFastPass && fastpassStep) {
    const { action } = fastpassStep;

    const fastPass: ControlElement = {
      type: 'Control',
      label: 'oktaVerify.button',
      scope: `#/properties/${ButtonOptionType.SIGN_IN_WITH_FASTPASS}`,
      options: {
        format: 'button',
        type: ButtonOptionType.SIGN_IN_WITH_FASTPASS,
        // TODO when adding fastpass support.
        // hook up the actual URL from device challenge remediation object in
        // remedation array. The target URL is driven by the API response directly.
        // @see: https://github.com/okta/okta-signin-widget/blob/8a115ae645c6f541b5bb921fd15d0099443de8b6/src/v2/view-builder/views/signin/SignInWithDeviceOption.js#L29-L42
        deviceChallengeUrl: 'http://www.okta.com',
        action,
      },
    };

    elements.push(fastPass);
  }

  const unlockStep = transaction.availableSteps?.find(
    ({ name }) => name === ButtonOptionType.UNLOCK_ACCOUNT,
  );
  if (config.stepWithUnlockAccount && unlockStep) {
    const { action } = unlockStep;
    const unlock: ControlElement = {
      type: 'Control',
      label: 'unlockaccount',
      scope: `#/properties/${ButtonOptionType.UNLOCK_ACCOUNT}`,
      options: {
        format: 'button',
        type: ButtonOptionType.UNLOCK_ACCOUNT,
        variant: 'secondary',
        action,
      },
    };

    elements.push(unlock);
  }

  const selectVerifyStep = getButtonStep(IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
  if (config.verifyWithOther && selectVerifyStep) {
    const { action } = selectVerifyStep;
    elements.push({
      type: 'Control',
      label: 'oie.verification.switch.authenticator',
      scope: `#/properties/${ButtonOptionType.CHANGE_AUTHENTICATOR}`,
      options: {
        format: 'button',
        variant: 'secondary',
        action,
      },
    } as ControlElement);
  }

  const selectEnrollStep = getButtonStep(IDX_STEP.SELECT_AUTHENTICATOR_ENROLL);
  if (config.backToAuthList && selectEnrollStep) {
    const { action } = selectEnrollStep;
    elements.push({
      type: 'Control',
      label: 'oie.enroll.switch.authenticator',
      scope: `#/properties/${ButtonOptionType.CHANGE_AUTHENTICATOR}`,
      options: {
        format: 'button',
        variant: 'secondary',
        action,
      },
    } as ControlElement);
  }

  const cancelStep = getButtonStep(ButtonOptionType.CANCEL);
  if (config.stepWithCancel && cancelStep) {
    const { action } = cancelStep;
    const cancel: ControlElement = {
      type: 'Control',
      label: 'goback',
      scope: `#/properties/${ButtonOptionType.CANCEL}`,
      options: {
        format: 'button',
        type: ButtonOptionType.CANCEL,
        variant: 'secondary',
        action,
      },
    };

    elements.push(cancel);
  }

  return { elements, properties };
};

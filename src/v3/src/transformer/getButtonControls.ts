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
import { IdxMethod } from 'src/types';

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
  idxMethod?: IdxMethod;
  stepWithUnlockAccount?: boolean;
}

export enum ButtonOptionType {
  SUBMIT = 'submit',
  CANCEL = 'cancel',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgotPassword',
  SIGN_IN_WITH_FASTPASS = 'signInWithFastPass',
  UNLOCK_ACCOUNT = 'unlockAccount',
}

export const getButtonControls = (
  config: GetButtonControlsArgs,
): GetButtonControls => {
  const elements = [];
  const properties: JsonSchema7['properties'] = {};

  if (config.stepWithSubmit) {
    properties[ButtonOptionType.SUBMIT] = {
      type: 'string',
    };

    const submit: ControlElement = {
      type: 'Control',
      label: 'oie.registration.form.update.submit',
      scope: `#/properties/${ButtonOptionType.SUBMIT}`,
      options: {
        format: 'button',
        type: ButtonOptionType.SUBMIT,
        idxMethod: config.idxMethod,
      },
    };

    elements.push(submit);
  }

  if (config.stepWithCancel) {
    properties[ButtonOptionType.CANCEL] = {
      type: 'string',
    };

    const cancel: ControlElement = {
      type: 'Control',
      label: 'oform.cancel',
      scope: `#/properties/${ButtonOptionType.CANCEL}`,
      options: {
        format: 'button',
        type: ButtonOptionType.CANCEL,
      },
    };

    elements.push(cancel);
  }

  if (config.stepWithRegister) {
    properties[ButtonOptionType.REGISTER] = {
      type: 'string',
    };

    const register: ControlElement = {
      type: 'Control',
      label: 'registration.form.submit',
      scope: `#/properties/${ButtonOptionType.REGISTER}`,
      options: {
        format: 'button',
        type: ButtonOptionType.REGISTER,
        variant: 'clear',
      },
    };

    elements.push(register);
  }

  if (config.stepWithForgotPassword) {
    properties[ButtonOptionType.FORGOT_PASSWORD] = {
      type: 'string',
    };

    const forgotPassword: ControlElement = {
      type: 'Control',
      label: 'forgotpassword',
      scope: `#/properties/${ButtonOptionType.FORGOT_PASSWORD}`,
      options: {
        format: 'button',
        type: ButtonOptionType.FORGOT_PASSWORD,
        variant: 'clear',
      },
    };

    elements.push(forgotPassword);
  }

  if (config.stepWithSignInWithFastPass) {
    properties[ButtonOptionType.SIGN_IN_WITH_FASTPASS] = {
      type: 'string',
    };

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
      },
    };

    elements.push(fastPass);
  }

  if (config.stepWithUnlockAccount) {
    properties[ButtonOptionType.UNLOCK_ACCOUNT] = {
      type: 'string',
    };

    const unlock: ControlElement = {
      type: 'Control',
      label: 'unlockaccount',
      scope: `#/properties/${ButtonOptionType.UNLOCK_ACCOUNT}`,
      options: {
        format: 'button',
        type: ButtonOptionType.UNLOCK_ACCOUNT,
        variant: 'clear',
      },
    };

    elements.push(unlock);
  }

  return { elements, properties };
};

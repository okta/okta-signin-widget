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

import { IDX_STEP } from '../../constants';
import {
  AutoSubmitElement,
  IdxStepTransformer,
  RedirectElement,
  SpinnerElement,
  TitleElement,
} from '../../types';
import { loc } from '../../util';

export const transformAppleSsoExtension: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema } = formBag;
  const { nextStep: { name: stepName } = {}, neededToProceed } = transaction;

  if (typeof stepName === 'undefined') {
    return formBag;
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('deviceTrust.sso.redirectText', 'login'),
    },
  };

  const spinnerElement = {
    type: 'Spinner',
  } as SpinnerElement;

  uischema.elements = [
    titleElement,
    spinnerElement,
  ];

  const autoSubmitElement: AutoSubmitElement = {
    type: 'AutoSubmit',
    options: {
      step: stepName,
    },
  };

  if (stepName === IDX_STEP.DEVICE_APPLE_SSO_EXTENSION) {
    // transaction nextStep does not contain href and method for some reason so we have to grab it from neededToProceed property
    const nextStepData = neededToProceed?.find(
      (step) => step.name === IDX_STEP.DEVICE_APPLE_SSO_EXTENSION,
    );
    const isGetMethod = nextStepData?.method?.toLowerCase() === 'get';

    if (isGetMethod) {
      uischema.elements.push({
        type: 'Redirect',
        options: {
          url: nextStepData?.href,
        },
      } as RedirectElement);
    } else {
      uischema.elements.push(autoSubmitElement);
    }
  } else {
    // This case handles the 'cancel-transaction' step when the 'device-apple-sso-extension' authenticator does not exist
    uischema.elements.push(autoSubmitElement);
  }

  return formBag;
};

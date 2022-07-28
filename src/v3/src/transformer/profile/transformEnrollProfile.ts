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

import { IDX_STEP, PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  IdxStepTransformer,
  PasswordRequirementsData,
  PasswordRequirementsElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { getUserInfo } from '../../util';
import { getUIElementWithName } from '../utils';

export const transformEnrollProfile: IdxStepTransformer = ({ transaction, formBag }) => {
  const { availableSteps, nextStep: { relatesTo } = {} } = transaction;
  const { uischema } = formBag;

  // If passcode exists in elements, add password requirements element to Ui
  const passwordElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;
  if (passwordElement) {
    passwordElement.options = {
      ...passwordElement.options,
      attributes: {
        ...passwordElement.options?.attributes,
        autocomplete: 'new-password',
      },
    };
    const passwordRequirementsElement: PasswordRequirementsElement = {
      type: 'PasswordRequirements',
      options: {
        id: 'password-authenticator--list',
        userInfo: getUserInfo(transaction),
        data: (relatesTo?.value?.settings || {}) as PasswordRequirementsData,
        fieldKey: 'credentials.passcode',
        validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
      },
    };
    uischema.elements.unshift(passwordRequirementsElement);
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: 'oie.registration.form.title' },
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: 'oie.registration.form.submit',
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
      dataType: 'save',
    },
  };

  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  const selectIdentifyStep = availableSteps?.find(({ name }) => name === IDX_STEP.SELECT_IDENTIFY);
  if (selectIdentifyStep) {
    const { name: step } = selectIdentifyStep;
    uischema.elements.push({
      type: 'Button',
      label: 'haveaccount',
      options: {
        type: ButtonType.BUTTON,
        variant: 'floating',
        wide: false,
        dataSe: 'back',
        step,
      },
    } as ButtonElement);
  }

  return formBag;
};

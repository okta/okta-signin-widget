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
  FieldElement,
  IdxStepTransformer,
  PasswordRequirementsElement,
  PasswordSettings,
  TitleElement,
} from 'src/types';

import { PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS } from '../../constants';
import { getUserInfo, loc } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { buildPasswordRequirementListItems } from './passwordSettingsUtils';

export const transformEnrollPasswordAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep: { relatesTo } = {} } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;

  const { uischema } = formBag;

  let passwordFieldName = 'credentials.passcode';
  let passwordElement = getUIElementWithName(
    passwordFieldName,
    uischema.elements as FieldElement[],
  ) as FieldElement;
  if (!passwordElement) {
    passwordFieldName = 'credentials.newPassword';
    passwordElement = getUIElementWithName(
      passwordFieldName,
      uischema.elements as FieldElement[],
    ) as FieldElement;
  }
  if (passwordElement) {
    passwordElement.options = {
      ...passwordElement.options,
      attributes: {
        ...passwordElement.options?.attributes,
        autocomplete: 'new-password',
      },
    };
  }
  uischema.elements = removeUIElementWithName(
    passwordFieldName,
    uischema.elements,
  );

  const passwordEnrollmentElement = {
    type: 'PasswordEnrollment',
    options: {
      input: passwordElement,
      buttonConfig: {
        label: 'oform.next',
      },
    },
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.password.enroll.title', 'login') },
  };

  const passwordRequirementsElement: PasswordRequirementsElement = {
    type: 'PasswordRequirements',
    options: {
      id: 'password-authenticator--list',
      header: loc('password.complexity.requirements.header', 'login'),
      userInfo: getUserInfo(transaction),
      settings: passwordSettings,
      requirements: buildPasswordRequirementListItems(passwordSettings),
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  uischema.elements.unshift(passwordEnrollmentElement);
  uischema.elements.unshift(passwordRequirementsElement);
  uischema.elements.unshift(titleElement);

  return formBag;
};

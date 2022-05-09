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
import {
  PasswordRequirementsData,
} from 'src/components/renderers/passwordRequirementsControl/passwordRequirementsData';
import {
  IdxStepTransformer,
  PasswordRequirementsElement,
  TitleElement,
} from 'src/types';

import { IDX_STEP } from '../../constants';
import { getUserInfo } from '../../util';

const getPasswordTitle = (stepName: string) => {
  if (stepName === IDX_STEP.ENROLL_AUTHENTICATOR) {
    return 'oie.password.enroll.title';
  } if (stepName === IDX_STEP.RESET_AUTHENTICATOR) {
    return 'password.reset.title.generic';
  } if (stepName === IDX_STEP.REENROLL_AUTHENTICATOR) {
    return 'password.expired.title.generic';
  }
  return '';
};

const getPasswordMatchingKey = (
  properties?: { [property: string]: JsonSchema7 },
): string | undefined => {
  if (properties?.password) {
    return 'password';
  }

  if (properties?.newPassword) {
    return 'newPassword';
  }

  if (properties?.passcode) {
    return 'passcode';
  }

  // Should never hit this case as it should be one of values defined above
  return undefined;
};

const PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS = 50;

export const transformPasswordAuthenticator: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { authenticator, name: stepName } } = transaction;

  // There should at least be some setting defined, so this may never happen
  if (!authenticator || !authenticator.settings) {
    return formBag;
  }

  const { settings } = authenticator;

  const { schema, uischema } = formBag;
  schema.properties = schema.properties ?? {};
  schema.required = schema.required ?? [];

  const matchingPasswordScope = getPasswordMatchingKey(schema.properties);

  schema.properties.confirmPassword = {
    type: 'string',
    // Enables cross schema property validation
    // see: https://ajv.js.org/guide/combining-schemas.html#data-reference
    const: { $data: `1/${matchingPasswordScope}` },
    minLength: 1,
  };
  schema.properties.passwordRequirements = {
    type: 'object',
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: getPasswordTitle(stepName),
    },
  };

  const passwordRequirementsElement: PasswordRequirementsElement = {
    type: 'Control',
    scope: '#/properties/passwordRequirements',
    options: {
      format: 'PasswordRequirements',
      userInfo: getUserInfo(transaction),
      data: settings as PasswordRequirementsData,
      fieldKey: matchingPasswordScope ?? '',
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  const confirmPasswordElement: ControlElement = {
    type: 'Control',
    label: 'oie.password.confirmPasswordLabel',
    scope: '#/properties/confirmPassword',
    options: {
      format: 'password',
    },
  };

  uischema.elements.unshift(passwordRequirementsElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(confirmPasswordElement);

  return formBag;
};

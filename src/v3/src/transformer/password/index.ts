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
import set from 'lodash/set';
import {
  PasswordRequirementsData,
} from 'src/components/renderers/passwordRequirementsControl/passwordRequirementsData';
import {
  IdxStepTransformer,
  PasswordRequirementsElement,
  TitleElement,
  Undefinable,
} from 'src/types';

import { IDX_STEP } from '../../constants';
import { getUserInfo } from '../../util';

const getPasswordMatchingKey = (
  properties?: { [property: string]: JsonSchema7 },
): Undefinable<string> => {
  const baseObj = properties?.credentials?.properties;
  if (baseObj?.passcode) {
    return 'passcode';
  }

  if (baseObj?.password) {
    return 'password';
  }

  if (baseObj?.newPassword) {
    return 'newPassword';
  }

  // Should never hit this case as it should be one of values defined above
  return undefined;
};

const PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS = 50;
const STEP_TO_TITLE: Record<string, Record<string, string>> = {
  [IDX_STEP.RESET_AUTHENTICATOR]: {
    generic: 'password.reset.title.generic',
    specific: 'password.reset.title.specific',
  },
  [IDX_STEP.REENROLL_AUTHENTICATOR]: {
    generic: 'password.expired.title.generic',
    specific: 'password.expired.title.specific',
  },
};

const getContentTitleAndParams = (
  stepName: string,
  brandName?: string,
): TitleElement['options'] => {
  // Enrollment Title does not interpolate brand name, so no need to include it
  if (stepName === IDX_STEP.ENROLL_AUTHENTICATOR) {
    return { content: 'oie.password.enroll.title' };
  }

  if (brandName) {
    return { content: STEP_TO_TITLE[stepName].specific, contentParams: [brandName] };
  }
  return { content: STEP_TO_TITLE[stepName].generic };
};

export const transformPasswordAuthenticator: IdxStepTransformer = (
  transaction,
  formBag,
  widgetProps,
) => {
  const { brandName } = widgetProps;
  const { nextStep: { relatesTo, name: stepName } } = transaction;

  // There should at least be some setting defined, so this may never happen
  if (!relatesTo?.value?.settings) {
    return formBag;
  }

  const { value: { settings } } = relatesTo;

  const { schema, uischema } = formBag;
  schema.properties = schema.properties ?? {};
  schema.required = schema.required ?? [];

  const matchingPasswordScope = getPasswordMatchingKey(schema.properties);

  set(
    schema,
    ['properties', 'credentials', 'properties', 'confirmPassword'],
    {
      type: 'string',
      // Enables cross schema property validation
      // see: https://ajv.js.org/guide/combining-schemas.html#data-reference
      const: { $data: `1/${matchingPasswordScope}` },
      minLength: 1,
    },
  );

  const titleElement: TitleElement = {
    type: 'Title',
    options: getContentTitleAndParams(stepName, brandName),
  };

  const passwordRequirementsElement: PasswordRequirementsElement = {
    type: 'PasswordRequirements',
    options: {
      id: '#/properties/passwordRequirements',
      userInfo: getUserInfo(transaction),
      data: settings as PasswordRequirementsData,
      fieldKey: `credentials.${matchingPasswordScope}`,
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  const confirmPasswordElement: ControlElement = {
    type: 'Control',
    label: 'oie.password.confirmPasswordLabel',
    scope: '#/properties/credentials/properties/confirmPassword',
    options: {
      secret: true,
    },
  };

  uischema.elements.unshift(passwordRequirementsElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(confirmPasswordElement);

  return formBag;
};

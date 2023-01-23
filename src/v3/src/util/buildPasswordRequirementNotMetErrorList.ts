/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxMessageWithName, ListItem, PasswordValidation } from '../types';
import { loc } from './locUtil';

export const buildPasswordRequirementNotMetErrorList = (
  passwordRequirements: ListItem[],
  passwordValidations: PasswordValidation,
  fieldName: string,
): IdxMessageWithName[] => {
  const errorMessages: IdxMessageWithName[] = [];

  passwordRequirements.forEach((requirement: ListItem) => {
    const ruleValue = passwordValidations[requirement.ruleKey];
    if (ruleValue === false) {
      errorMessages.push({
        name: fieldName,
        class: 'ERROR',
        message: requirement.label,
        i18n: { key: '' },
      });
    }
  });

  if (errorMessages.length > 0) {
    // TODO: Add ticket here to create new translation key that includes colon
    errorMessages.unshift({
      name: fieldName,
      class: 'ERROR',
      message: loc('registration.error.password.passwordRequirementsNotMet', 'login'),
      i18n: { key: 'registration.error.password.passwordRequirementsNotMet' },
    });
  }

  return errorMessages;
};

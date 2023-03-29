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

import { ListItem, PasswordValidation, WidgetMessage } from '../types';
import { loc } from './locUtil';

export const buildPasswordRequirementNotMetErrorList = (
  passwordRequirements: ListItem[],
  passwordValidations: PasswordValidation,
  fieldName: string,
): WidgetMessage[] => {
  const widgetMessages: WidgetMessage[] = [];
  const errorMessages: string[] = [];

  passwordRequirements.forEach((requirement: ListItem) => {
    const ruleValue = passwordValidations[requirement.ruleKey];
    if (ruleValue === false) {
      errorMessages.push(requirement.label);
    }
  });

  if (errorMessages.length > 0) {
    widgetMessages.push({
      description: loc('registration.error.password.passwordRequirementsNotMet.prefix', 'login'),
      message: errorMessages.map((message: string) => ({
        class: 'ERROR', i18n: { key: '' }, name: fieldName, message,
      } as WidgetMessage)),
    });
  }

  return widgetMessages;
};

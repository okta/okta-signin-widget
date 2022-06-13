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

import { UserInfo } from 'src/types';

import { PasswordSettings, PasswordValidation } from '../components/renderers/passwordRequirementsControl/passwordRequirementsData';

const PasswordValidatorFunctionNames = Object.freeze({
  MinLengthValidator: 'minLengthValidator',
  MinLowerCaseValidator: 'minLowerCaseValidator',
  MinUpperCaseValidator: 'minUpperCaseValidator',
  MinNumberValidator: 'minNumberValidator',
  MinSymbolValidator: 'minSymbolValidator',
  ExcludeUsernameValidator: 'excludeUsernameValidator',
  ExcludeFirstNameValidator: 'excludeFirstNameValidator',
  ExcludeLastNameValidator: 'excludeLastNameValidator',
  ExcludeAttributesValidator: 'excludeAttributesValidator',
});

const minLengthValidator = (password: string, limit: unknown): boolean => (
  !(limit as number) || (password.length ?? 0) >= (limit as number)
);

const minLowerCaseValidator = (password: string, limit: unknown): boolean => (
  !(limit as number) || (password.match(/\p{Ll}/u)?.length || 0) >= (limit as number)
);

const minUpperCaseValidator = (password: string, limit: unknown): boolean => (
  !(limit as number) || (password.match(/\p{Lu}/u)?.length || 0) >= (limit as number)
);

const minNumberValidator = (password: string, limit: unknown): boolean => (
  !(limit as number) || (password.match(/[0-9]/)?.length || 0) >= (limit as number)
);

const minSymbolValidator = (password: string, limit: unknown): boolean => (
  !(limit as number) || (password.match(/["!#$%&'()*+,-./\\:;<=>?@[\]^_`{|}~]/)?.length || 0) >= (limit as number)
);

const excludeAttributeValidator = (
  password: string,
  ruleEnabled: boolean,
  attributeVal: string,
): boolean => {
  if (ruleEnabled) {
    return password ? !new RegExp(attributeVal, 'i').test(password) : false;
  }
  return true;
};

const excludeUsernameValidator = (
  password: string,
  ruleVal: unknown,
  userInfo: UserInfo,
): boolean => (
  !userInfo.identifier
    ? true
    : excludeAttributeValidator(password, ruleVal as boolean, userInfo.identifier)
);

const excludeFirstNameValidator = (
  password: string,
  ruleVal: unknown,
  userInfo: UserInfo,
): boolean => (
  !userInfo?.profile?.firstName
    ? true
    : excludeAttributeValidator(password, ruleVal as boolean, userInfo.profile.firstName)
);

const excludeLastNameValidator = (
  password: string,
  ruleVal: unknown,
  userInfo: UserInfo,
): boolean => (
  !userInfo?.profile?.lastName
    ? true
    : excludeAttributeValidator(password, ruleVal as boolean, userInfo.profile.lastName)
);

const ValidatorFunctions = {
  [PasswordValidatorFunctionNames.MinLengthValidator]: minLengthValidator,
  [PasswordValidatorFunctionNames.MinLowerCaseValidator]: minLowerCaseValidator,
  [PasswordValidatorFunctionNames.MinUpperCaseValidator]: minUpperCaseValidator,
  [PasswordValidatorFunctionNames.MinNumberValidator]: minNumberValidator,
  [PasswordValidatorFunctionNames.MinSymbolValidator]: minSymbolValidator,
  [PasswordValidatorFunctionNames.ExcludeUsernameValidator]: excludeUsernameValidator,
  [PasswordValidatorFunctionNames.ExcludeFirstNameValidator]: excludeFirstNameValidator,
  [PasswordValidatorFunctionNames.ExcludeLastNameValidator]: excludeLastNameValidator,
};

const excludeAttributes = (
  password: string,
  ruleVal: unknown,
  userInfo: UserInfo,
): { [key: string]: boolean } => {
  const ruleValidations: { [key: string]: boolean } = {};
  if (Array.isArray(ruleVal)) {
    ruleVal.forEach((attr) => {
      const validatorFn = ValidatorFunctions[`exclude${attr.charAt(0).toUpperCase() + attr.slice(1)}Validator`];
      if (!validatorFn) {
        return;
      }
      ruleValidations[attr] = validatorFn(password, true, userInfo);
    });
  }
  return ruleValidations;
};

export const validatePassword = (
  password: string,
  userInfo: UserInfo,
  settings?: PasswordSettings,
): PasswordValidation => {
  let passwordValidations: PasswordValidation = {};

  if (!settings || (!settings.complexity && !settings.age)) {
    return passwordValidations;
  }

  if (settings.complexity && typeof settings.complexity === 'object') {
    const { complexity } = settings;
    Object.keys(complexity).forEach((rule) => {
      const ruleValue = complexity[rule as keyof unknown];
      if (rule === 'excludeAttributes') {
        const excludeValidations = excludeAttributes(password, ruleValue, userInfo);
        passwordValidations = {
          ...passwordValidations,
          ...excludeValidations,
        };
        return;
      }

      const validationFn = ValidatorFunctions[`${rule}Validator`];
      if (!validationFn) {
        return;
      }
      passwordValidations[rule] = validationFn(password, ruleValue, userInfo);
    });
  }

  return passwordValidations;
};

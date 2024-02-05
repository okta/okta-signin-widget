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
  PasswordSettings,
  PasswordValidation,
  UserInfo,
} from 'src/types';

const PasswordValidatorFunctionNames: Record<string, string> = Object.freeze({
  MinLengthValidator: 'minLengthValidator',
  MinLowerCaseValidator: 'minLowerCaseValidator',
  MinUpperCaseValidator: 'minUpperCaseValidator',
  MinNumberValidator: 'minNumberValidator',
  MinSymbolValidator: 'minSymbolValidator',
  ExcludeUsernameValidator: 'excludeUsernameValidator',
  ExcludeFirstNameValidator: 'excludeFirstNameValidator',
  ExcludeLastNameValidator: 'excludeLastNameValidator',
  ExcludeAttributesValidator: 'excludeAttributesValidator',
  UseADComplexityRequirementsValidator: 'useADComplexityRequirementsValidator',
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

/**
 * The MDN recommended expression for escaping all special characters in RegExp
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 */

const escapeRegExp = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
* Breaks apart a string based on a set of delimiters for (Copied from okta-core password validation logic)
* @see {@link https://github.com/okta/okta-core/blob/master/components/framework/security/api/src/main/java/com/saasure/framework/security/password/PasswordUtil.java#L72-L97}
*/
const getParts = (attributeVal: string): string[] => {
  const MIN_PARTS_LENGTH = 4;
  const parts: string[] = [];
  const delimiters = new Set<string>([',', '.', '-', '_', '#', '@']);
  const characters = Array.from(attributeVal);
  let combinedStringArr: string[] = [];

  characters.forEach((character) => {
    if (delimiters.has(character)) {
      // Parts must be at least MinPartsLength long
      if (combinedStringArr.length >= MIN_PARTS_LENGTH) {
        parts.push(combinedStringArr.join(''));
      }
      // Start a new part
      combinedStringArr = [];
    } else {
      combinedStringArr.push(character);
    }
  });

  if (combinedStringArr.length >= MIN_PARTS_LENGTH) {
    parts.push(combinedStringArr.join(''));
  }

  return parts;
};

const excludeAttributeValidator = (
  password: string,
  ruleEnabled: boolean,
  attributeVal: string,
): boolean => {
  if (ruleEnabled) {
    return password ? !new RegExp(escapeRegExp(attributeVal), 'i').test(password) : false;
  }
  return true;
};

/**
 * This mimics backend logic for validating if password contains username
 * @see {@link https://github.com/okta/okta-core/blob/master/components/platform/policy/impl/src/main/java/com/saasure/core/services/auth/password/impl/PasswordPolicyVerificationHelperImpl.java#L241-L250}
 */
const excludeUsernameValidator = (
  password: string,
  ruleVal: unknown,
  userInfo: UserInfo,
): boolean => {
  if (!userInfo.identifier) {
    return true;
  }
  const usernameParts = getParts(userInfo.identifier);
  // if any parts of username is included in password return false (meaning invalid)
  return usernameParts.every(
    (part) => excludeAttributeValidator(password, ruleVal as boolean, part),
  );
};

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

const useADComplexityRequirementsValidator = (
  password: string,
): boolean => {
  const requiredValidators: ((password: string, limit: unknown) => boolean)[] = [
    minLowerCaseValidator,
    minUpperCaseValidator,
    minNumberValidator,
    minSymbolValidator,
  ];

  // Runs the 4 validation functions and returns the number that passed
  const numRequirementsMet = requiredValidators.reduce((num, validator) => (
    validator(password, 1) ? num + 1 : num), 0);

  // AD password policy requires that at least 3 of the following validators are satisfied
  return numRequirementsMet >= 3;
};

const ValidatorFunctions = {
  [PasswordValidatorFunctionNames.MinLengthValidator]: minLengthValidator,
  [PasswordValidatorFunctionNames.MinLowerCaseValidator]: minLowerCaseValidator,
  [PasswordValidatorFunctionNames.MinUpperCaseValidator]: minUpperCaseValidator,
  [PasswordValidatorFunctionNames.MinNumberValidator]: minNumberValidator,
  [PasswordValidatorFunctionNames.MinSymbolValidator]: minSymbolValidator,
  [PasswordValidatorFunctionNames.ExcludeUsernameValidator]: excludeUsernameValidator,
  [PasswordValidatorFunctionNames.ExcludeFirstNameValidator]: excludeFirstNameValidator,
  [PasswordValidatorFunctionNames.ExcludeLastNameValidator]: excludeLastNameValidator,
  [PasswordValidatorFunctionNames.UseADComplexityRequirementsValidator]:
    useADComplexityRequirementsValidator,
};

const excludeAttributes = (
  password: string,
  ruleVal: unknown,
  userInfo: UserInfo,
): PasswordValidation => {
  const ruleValidations: PasswordValidation = {};
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

  if (!settings?.complexity || Object.keys(settings.complexity).length === 0) {
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

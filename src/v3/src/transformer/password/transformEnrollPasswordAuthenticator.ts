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

import { PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS } from '../../constants';
import {
  FieldElement,
  FormBag,
  HiddenInputElement,
  IdxStepTransformer,
  PasswordMatchesElement,
  PasswordRequirementsElement,
  PasswordSettings,
  TitleElement,
  WidgetMessage,
} from '../../types';
import {
  buildPasswordRequirementNotMetErrorList,
  getUserInfo,
  loc,
  updatePasswordRequirementsNotMetMessage,
  validatePassword,
} from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { buildPasswordRequirementListItems } from './passwordSettingsUtils';

export const transformEnrollPasswordAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep: { relatesTo } = {} } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;

  const { uischema, dataSchema } = formBag;
  const userInfo = getUserInfo(transaction);
  const requirements = buildPasswordRequirementListItems(passwordSettings);

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

  const confirmPasswordElement: FieldElement = {
    type: 'Field',
    label: loc('oie.password.confirmPasswordLabel', 'login'),
    key: 'confirmPassword',
    options: {
      inputMeta: {
        name: 'confirmPassword',
        secret: true,
        // @ts-ignore TODO: OKTA-539834 - messages missing from type
        messages: { value: undefined },
      },
      attributes: { autocomplete: 'new-password' },
    },
  };

  // @ts-ignore TODO: OKTA-539834 - messages missing from type
  if (passwordElement.options.inputMeta.messages?.value?.length) {
    // @ts-ignore TODO: OKTA-539834 - messages missing from type
    const errorMessages = passwordElement.options.inputMeta.messages.value;
    const newPasswordErrors = errorMessages.filter((message: WidgetMessage) => {
      const { name: newPwName } = passwordElement.options.inputMeta;
      return message.name === newPwName || message.name === undefined;
    });
    if (newPasswordErrors?.length) {
      const messages = updatePasswordRequirementsNotMetMessage(newPasswordErrors);
      // @ts-ignore TODO: OKTA-539834 - messages missing from type
      passwordElement.options.inputMeta.messages.value = messages;
    } else {
      // @ts-ignore TODO: OKTA-539834 - messages missing from type
      passwordElement.options.inputMeta.messages.value = undefined;
    }

    const confirmPasswordError = errorMessages.find((message: WidgetMessage) => {
      const { name: confirmPwName } = confirmPasswordElement.options.inputMeta;
      return message.name === confirmPwName;
    });
    if (confirmPasswordError) {
      // @ts-ignore TODO: OKTA-539834 - messages missing from type
      confirmPasswordElement.options.inputMeta.messages.value = [confirmPasswordError];
    }
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.password.enroll.title', 'login') },
  };

  const passwordRequirementsElement: PasswordRequirementsElement = {
    type: 'PasswordRequirements',
    options: {
      id: 'password-authenticator--list',
      header: loc('password.complexity.requirements.header', 'login'),
      userInfo,
      settings: passwordSettings,
      requirements,
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  const passwordMatchesElement: PasswordMatchesElement = {
    type: 'PasswordMatches',
    key: 'passwordMatchesValidation',
    options: {
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  uischema.elements.unshift(passwordMatchesElement);
  uischema.elements.unshift(confirmPasswordElement);
  uischema.elements.unshift(passwordElement);
  uischema.elements.unshift({
    type: 'HiddenInput',
    noMargin: true,
    options: { name: 'username', value: userInfo.identifier },
  } as HiddenInputElement);
  if (Object.keys(passwordSettings)?.length > 0) {
    uischema.elements.unshift(passwordRequirementsElement);
  }
  uischema.elements.unshift(titleElement);

  // update default dataSchema
  dataSchema.fieldsToExclude = () => (['confirmPassword', 'passwordMatchesValidation']);
  dataSchema.fieldsToValidate.push('confirmPassword');
  dataSchema.fieldsToValidate.push('passwordMatchesValidation');

  // Controls form submission validation
  dataSchema[passwordFieldName] = {
    validate: (data: FormBag['data']) => {
      const newPw = data[passwordFieldName] as string;
      const confirmPw = data.confirmPassword;
      const errorMessages: WidgetMessage[] = [];
      if (!newPw) {
        errorMessages.push({
          name: passwordFieldName,
          class: 'ERROR',
          message: loc('model.validation.field.blank', 'login'),
          i18n: { key: 'model.validation.field.blank' },
        });
      }
      if (!confirmPw) {
        errorMessages.push({
          name: 'confirmPassword',
          class: 'ERROR',
          message: loc('model.validation.field.blank', 'login'),
          i18n: { key: 'model.validation.field.blank' },
        });
      }
      if (newPw) {
        const validations = validatePassword(newPw, userInfo, passwordSettings);
        const requirementNotMetMessages = buildPasswordRequirementNotMetErrorList(
          requirements,
          validations,
          passwordFieldName,
        );
        errorMessages.push(...requirementNotMetMessages);
      }
      if (newPw && confirmPw && newPw !== confirmPw) {
        errorMessages.push({
          name: 'confirmPassword',
          class: 'ERROR',
          message: loc('password.enroll.error.match', 'login'),
          i18n: { key: 'password.enroll.error.match' },
        });
      }
      return errorMessages.length > 0 ? errorMessages : undefined;
    },
  };

  return formBag;
};

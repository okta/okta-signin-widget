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
  IdxMessageWithName,
  IdxStepTransformer,
  PasswordMatchesElement,
  PasswordRequirementsElement,
  PasswordSettings,
  TitleElement,
} from '../../types';
import { getUserInfo, loc, updatePasswordRequirementsNotMetMessage } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { buildPasswordRequirementListItems } from './passwordSettingsUtils';

export const transformEnrollPasswordAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep: { relatesTo } = {} } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;

  const { uischema, dataSchema } = formBag;

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
    const newPasswordErrors = errorMessages.filter((message: IdxMessageWithName) => {
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

    const confirmPasswordError = errorMessages.find((message: IdxMessageWithName) => {
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
      userInfo: getUserInfo(transaction),
      settings: passwordSettings,
      requirements: buildPasswordRequirementListItems(passwordSettings),
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

  const userInfo = getUserInfo(transaction);
  uischema.elements = [
    titleElement,
    ...(Object.keys(passwordSettings)?.length > 0
      ? [passwordRequirementsElement]
      : []
    ),
    {
      type: 'HiddenInput',
      noMargin: true,
      options: { name: 'username', value: userInfo.identifier },
    } as HiddenInputElement,
    passwordElement,
    confirmPasswordElement,
    passwordMatchesElement,
  ];

  // update default dataSchema
  dataSchema.fieldsToExclude = () => (['confirmPassword', 'passwordMatchesValidation']);
  dataSchema.fieldsToValidate.push('confirmPassword');
  dataSchema.fieldsToValidate.push('passwordMatchesValidation');

  // Controls live field change validation
  dataSchema.confirmPassword = {
    validate: (data: FormBag['data']) => {
      const confirmPw = data.confirmPassword;
      if (!confirmPw) {
        return [{
          name: 'confirmPassword',
          class: 'ERROR',
          message: loc('model.validation.field.blank', 'login'),
          i18n: { key: 'model.validation.field.blank' },
        }];
      }
      return undefined;
    },
  };

  // Controls form submission validation
  dataSchema[passwordFieldName] = {
    validate: (data: FormBag['data']) => {
      const newPw = data[passwordFieldName];
      const confirmPw = data.confirmPassword;
      const errorMessages: IdxMessageWithName[] = [];
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
      return errorMessages.length > 0 ? errorMessages : undefined;
    },
  };
  dataSchema.passwordMatchesValidation = {
    validate: (data: FormBag['data']) => {
      const newPw = data[passwordFieldName];
      const confirmPw = data.confirmPassword;
      if (newPw !== confirmPw) {
        // This error is not displayed by the component, however it is used to block
        // form submission by marking the field as invalid
        return [{
          name: 'passwordMatchesValidation',
          class: 'ERROR',
          message: loc('password.error.match', 'login'),
          i18n: { key: 'password.error.match' },
        }];
      }
      return undefined;
    },
  };

  return formBag;
};

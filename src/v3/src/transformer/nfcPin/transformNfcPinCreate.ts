/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
  DescriptionElement,
  FieldElement,
  FormBag,
  IdxStepTransformer,
  IWidgetContext,
  LinkElement,
  PasswordMatchesElement,
  PasswordRequirementsElement,
  PasswordSettings,
  TitleElement,
  WidgetMessage,
} from '../../types';
import {
  buildPasswordRequirementNotMetErrorList,
  getUserInfo,
  hasMinAuthenticatorOptions,
  loc,
  updateTransactionWithNextStep,
  validatePassword,
} from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { buildPasswordRequirementListItems } from '../password/passwordSettingsUtils';

/**
 * NFC PIN creation transformer.
 * Direct adaptation of transformEnrollPasswordAuthenticator for PIN.
 */
export const transformNfcPinCreate: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep: { relatesTo } = {}, context } = transaction;

  // PIN settings — map to PasswordSettings format
  const rawSettings = (
    relatesTo?.value?.settings
    // @ts-ignore enrollmentAuthenticator may not be typed
    || context?.enrollmentAuthenticator?.value?.settings
    || {}
  ) as { minLength?: number; maxLength?: number };

  const pinLength = rawSettings.minLength || rawSettings.maxLength || 0;
  const passwordSettings: PasswordSettings = {
    complexity: { minLength: pinLength },
  };

  const { uischema, dataSchema } = formBag;
  const userInfo = getUserInfo(transaction);
  const requirements = buildPasswordRequirementListItems(passwordSettings);

  // Find passcode field (same as password transformer)
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
    passwordElement.label = loc('oie.enroll.nfc_pin.create.pinLabel', 'login');
    passwordElement.options = {
      ...passwordElement.options,
      attributes: {
        ...passwordElement.options?.attributes,
        autocomplete: 'new-password',
        inputmode: 'numeric',
      },
    };
  }
  uischema.elements = removeUIElementWithName(
    passwordFieldName,
    uischema.elements,
  );

  // Confirm PIN field (same pattern as password confirm)
  const confirmPasswordElement: FieldElement = {
    type: 'Field',
    label: loc('oie.enroll.nfc_pin.create.confirmPinLabel', 'login'),
    key: 'confirmPassword',
    options: {
      inputMeta: {
        name: 'confirmPassword',
        secret: true,
        // @ts-ignore messages not fully typed
        messages: { value: undefined },
      },
      attributes: {
        autocomplete: 'new-password',
        inputmode: 'numeric',
      },
    },
  };

  // Handle server-side error messages (same as password transformer)
  // @ts-ignore messages not fully typed
  if (passwordElement?.options?.inputMeta?.messages?.value?.length) {
    // @ts-ignore messages not fully typed
    const errorMessages = passwordElement.options.inputMeta.messages.value;
    const newPwErrors = errorMessages.filter((message: WidgetMessage) => {
      const { name: newPwName } = passwordElement.options.inputMeta;
      return message.name === newPwName || message.name === undefined;
    });
    if (newPwErrors?.length) {
      // @ts-ignore messages not fully typed
      passwordElement.options.inputMeta.messages.value = newPwErrors;
    } else {
      // @ts-ignore messages not fully typed
      passwordElement.options.inputMeta.messages.value = undefined;
    }

    const confirmPasswordError = errorMessages.find((message: WidgetMessage) => {
      const { name: confirmPwName } = confirmPasswordElement.options.inputMeta;
      return message.name === confirmPwName;
    });
    if (confirmPasswordError) {
      // @ts-ignore messages not fully typed
      confirmPasswordElement.options.inputMeta.messages.value = [confirmPasswordError];
    }
  }

  // Title
  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.enroll.nfc_pin.create.title', 'login') },
  };

  // Description
  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('oie.enroll.nfc_pin.create.description', 'login') },
  };

  // Requirements (live validation)
  const passwordRequirementsElement: PasswordRequirementsElement = {
    type: 'PasswordRequirements',
    options: {
      id: 'nfc-pin--requirements-list',
      header: loc('oie.enroll.nfc_pin.create.requirements.header', 'login'),
      userInfo,
      settings: passwordSettings,
      requirements,
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  // Match validation
  const passwordMatchesElement: PasswordMatchesElement = {
    type: 'PasswordMatches',
    key: 'passwordMatchesValidation',
    options: {
      validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
    },
  };

  // Submit button
  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('oform.next', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  // "Return to authenticator list" link
  const selectEnrollStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_ENROLL);
  const returnToListLink: LinkElement | undefined = selectEnrollStep ? {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('oie.enroll.switch.authenticator', 'login'),
      step: selectEnrollStep.name || '',
      onClick: (widgetContext?: IWidgetContext): unknown => {
        if (typeof widgetContext === 'undefined' || typeof selectEnrollStep === 'undefined') {
          return;
        }
        updateTransactionWithNextStep(transaction, selectEnrollStep, widgetContext);
      },
    },
  } : undefined;

  // "Back to sign in" link
  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: 'cancel',
    },
  };

  // Build UI with unshift (same as password transformer)
  uischema.elements.unshift(passwordMatchesElement);
  uischema.elements.unshift(confirmPasswordElement);
  uischema.elements.unshift(passwordElement);
  if (Object.keys(passwordSettings)?.length > 0) {
    uischema.elements.unshift(passwordRequirementsElement);
  }
  uischema.elements.unshift(descriptionElement);
  uischema.elements.unshift(titleElement);

  // Append submit + links at the end
  uischema.elements.push(submitButton);
  if (returnToListLink) {
    uischema.elements.push(returnToListLink);
  }
  uischema.elements.push(cancelLink);

  // dataSchema (exact same pattern as password transformer)
  dataSchema.fieldsToExclude = () => (['confirmPassword', 'passwordMatchesValidation']);
  dataSchema.fieldsToValidate.push('confirmPassword');
  dataSchema.fieldsToValidate.push('passwordMatchesValidation');

  // Validation (exact same pattern as password transformer)
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
          message: loc('oie.enroll.nfc_pin.create.error.match', 'login'),
          i18n: { key: 'oie.enroll.nfc_pin.create.error.match' },
        });
      }
      return errorMessages.length > 0 ? errorMessages : undefined;
    },
  };

  return formBag;
};

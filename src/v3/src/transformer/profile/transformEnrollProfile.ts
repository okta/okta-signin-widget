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

import { IDX_STEP, PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  DividerElement,
  FieldElement,
  FormBag,
  IdxStepTransformer,
  LinkElement,
  PasswordRequirementsData,
  PasswordRequirementsElement,
  TitleElement,
  UISchemaElement,
  UISchemaLayoutType,
  WidgetMessage,
} from '../../types';
import {
  buildPasswordRequirementNotMetErrorList,
  getUserProvidedUserInfo,
  loc,
  updatePasswordRequirementsNotMetMessage,
  validatePassword,
} from '../../util';
import { buildPasswordRequirementListItems } from '../password';
import { getUIElementWithName } from '../utils';

export const transformEnrollProfile: IdxStepTransformer = ({ transaction, formBag }) => {
  const {
    availableSteps,
    nextStep: { name: stepName, inputs } = {},
    context,
    neededToProceed,
  } = transaction;
  // @ts-ignore OKTA-538692 uiDisplay missing from interface
  const { uiDisplay: { value: { label, buttonLabel } = {} } = {} } = context;
  const currentRemediation = neededToProceed.find((remediation) => remediation.name === stepName);
  const isUpdateProfile = currentRemediation?.href?.endsWith('idp/idx/enroll/update');
  const { dataSchema, uischema } = formBag;

  const credentialsInput = inputs?.find((input) => input.name === 'credentials');
  const passwordSettings = (
    // @ts-ignore OKTA-545082 relatesTo prop missing from Input interface
    credentialsInput?.relatesTo?.value?.settings || {}
  ) as PasswordRequirementsData;
  const requirements = buildPasswordRequirementListItems(passwordSettings);

  // If passcode exists in elements, add password requirements element to Ui
  const passwordElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;
  if (passwordElement) {
    passwordElement.options = {
      ...passwordElement.options,
      attributes: {
        ...passwordElement.options?.attributes,
        autocomplete: 'new-password',
      },
    };
    // @ts-ignore TODO: OKTA-539834 - messages missing from type
    const passwordErrors = passwordElement.options.inputMeta.messages?.value;
    if (passwordErrors?.length) {
      const messages = updatePasswordRequirementsNotMetMessage(passwordErrors);
      // @ts-ignore TODO: OKTA-539834 - messages missing from type
      passwordElement.options.inputMeta.messages.value = messages;
    }
    const passwordRequirementsElement: PasswordRequirementsElement = {
      type: 'PasswordRequirements',
      noMargin: true,
      options: {
        id: 'password-authenticator--list',
        header: loc('password.complexity.requirements.header', 'login'),
        userInfo: {},
        settings: passwordSettings,
        requirements,
        validationDelayMs: PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS,
      },
    };
    if (Object.keys(passwordSettings)?.length) {
      // Positions password requirements element before the password field
      const insertIdx = uischema.elements.findIndex(
        (element) => element.type === 'Field'
          && (element as FieldElement).options?.inputMeta?.name === 'credentials.passcode',
      );
      uischema.elements.splice(insertIdx, 0, passwordRequirementsElement);
    }

    // Controls form submission validation
    dataSchema['credentials.passcode'] = {
      validate: (data: FormBag['data']) => {
        const newPw = data['credentials.passcode'] as string;
        const errorMessages: WidgetMessage[] = [];
        if (!newPw && passwordElement.options.inputMeta.required) {
          errorMessages.push({
            class: 'ERROR',
            message: loc('model.validation.field.blank', 'login'),
            i18n: { key: 'model.validation.field.blank' },
          });
        }
        if (newPw) {
          const userInfo = getUserProvidedUserInfo(data);
          const validations = validatePassword(newPw, userInfo, passwordSettings);
          const requirementNotMetMessages = buildPasswordRequirementNotMetErrorList(
            requirements,
            validations,
            'credentials.passcode',
          );
          errorMessages.push(...requirementNotMetMessages);
        }
        return errorMessages.length > 0 ? errorMessages : undefined;
      },
    };
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.registration.form.title', 'login') },
  };

  const subtitleElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('oie.form.field.optional.description', 'login') },
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('oie.registration.form.submit', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  if (isUpdateProfile) {
    if (label) {
      titleElement.options.content = loc('oie.registration.form.customize.label', 'login', [label]);
    } else {
      titleElement.options.content = loc('oie.primaryauth.submit', 'login');
    }

    if (buttonLabel) {
      submitBtnElement.label = loc('oie.registration.form.customize.buttonLabel', 'login', [buttonLabel]);
    } else {
      submitBtnElement.label = loc('oie.registration.form.update.submit', 'login');
    }
  }

  uischema.elements.unshift(subtitleElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  const selectIdentifyStep = availableSteps?.find(({ name }) => name === IDX_STEP.SELECT_IDENTIFY);
  if (selectIdentifyStep) {
    uischema.elements.push({ type: 'Divider' } as DividerElement);
    const { name: step } = selectIdentifyStep;
    const signinLink: LinkElement = {
      type: 'Link',
      contentType: 'footer',
      options: {
        label: loc('signin', 'login'),
        step,
      },
    };
    const signinLabel: DescriptionElement = {
      type: 'Description',
      options: {
        content: loc('haveaccount', 'login'),
        dataSe: 'haveaccount',
      },
    };
    const loginEntryLayout = {
      type: UISchemaLayoutType.HORIZONTAL,
      elements: [signinLabel, signinLink],
    };

    uischema.elements.push(loginEntryLayout);
  }

  return formBag;
};

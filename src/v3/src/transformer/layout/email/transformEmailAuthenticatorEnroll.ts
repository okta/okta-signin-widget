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
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  ReminderElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  TokenReplacement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../../types';
import { getCurrentAuthenticator, getUserInfo, loc } from '../../../util';
import { getUIElementWithName } from '../../utils';
import { getEmailAuthenticatorSubtitle } from './getEmailAuthenticatorSubtitle';

export const transformEmailAuthenticatorEnroll: IdxStepTransformer = ({ transaction, formBag }) => {
  const { availableSteps } = transaction;
  const { uischema } = formBag;
  const authenticatorContextualData = getCurrentAuthenticator(transaction)?.value?.contextualData;
  // @ts-ignore OKTA-551247 - useEmailMagicLink property missing from interface
  const useEmailMagicLink = authenticatorContextualData?.useEmailMagicLink;

  let reminderElement: ReminderElement | undefined;

  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (resendStep) {
    const { name } = resendStep;
    reminderElement = {
      type: 'Reminder',
      options: {
        content: loc('email.code.not.received', 'login'),
        buttonText: loc('email.button.resend', 'login'),
        step: name,
        isActionStep: true,
        actionParams: { resend: true },
      },
    };
  }

  const passcodeElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  );
  if (passcodeElement) {
    passcodeElement.focus = true;
  }

  const subTitleElement: DescriptionElement = {
    type: 'Description',
    options: { content: '' },
  };

  if (typeof useEmailMagicLink === 'undefined') {
    subTitleElement.options.content = loc('oie.email.enroll.subtitle', 'login');
  } else {
    const userInfo = getUserInfo(transaction);
    const emailAddress = userInfo?.profile?.email || userInfo.identifier;
    const tokenReplacement: TokenReplacement | undefined = typeof emailAddress !== 'undefined'
      ? { $1: { element: 'span', attributes: { class: 'strong no-translate' } } }
      : undefined;
    subTitleElement.options.content = getEmailAuthenticatorSubtitle(
      emailAddress,
      undefined,
      useEmailMagicLink,
      tokenReplacement,
    );
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.email.mfa.title', 'login'),
    },
  };

  const submitButtonElement: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  const codeEntryDisplayElements: UISchemaElement[] = [
    ...(reminderElement ? [reminderElement] : []),
    titleElement,
    subTitleElement,
    passcodeElement!,
    submitButtonElement,
  ];

  // If useEmailMagicLink not provided, show code entry by default
  if (typeof useEmailMagicLink === 'undefined' || !useEmailMagicLink) {
    uischema.elements = codeEntryDisplayElements;
    return formBag;
  }

  const showCodeStepperButton: StepperButtonElement = {
    type: 'StepperButton',
    label: loc('oie.email.verify.alternate.show.verificationCode.text', 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      nextStepIndex: 1,
    },
  };

  const stepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminderElement ? [reminderElement] : []),
          titleElement,
          subTitleElement,
          showCodeStepperButton,
        ],
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: codeEntryDisplayElements,
      } as UISchemaLayout,
    ],
  };

  uischema.elements = [stepper];

  return formBag;
};

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

import { NextStep } from '@okta/okta-auth-js';

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
import { getCurrentAuthenticator, loc } from '../../../util';
import { getUIElementWithName } from '../../utils';
import { getEmailAuthenticatorSubtitle } from './getEmailAuthenticatorSubtitle';

export const transformEmailAuthenticatorVerify: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { uischema } = formBag;
  const authenticatorContextualData = getCurrentAuthenticator(transaction)?.value?.contextualData;
  // @ts-ignore OKTA-551247 - useEmailMagicLink property missing from interface
  const useEmailMagicLinkValue = authenticatorContextualData?.useEmailMagicLink;
  const useEmailMagicLink = typeof useEmailMagicLinkValue !== 'undefined'
    ? useEmailMagicLinkValue
    : true;

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

  const redactedEmailAddress = nextStep.relatesTo?.value?.profile?.email;
  const redactedSecondaryEmailAddress = nextStep.relatesTo?.value?.profile?.secondaryEmail;

  const getTokenReplacement = (): TokenReplacement | undefined => {
    if (typeof redactedSecondaryEmailAddress !== 'undefined' && typeof redactedEmailAddress !== 'undefined') {
      return {
        $1: { element: 'span', attributes: { class: 'strong no-translate' } },
        $2: { element: 'span', attributes: { class: 'strong no-translate' } },
      };
    }
    if (typeof redactedEmailAddress !== 'undefined') {
      return { $1: { element: 'span', attributes: { class: 'strong no-translate' } } };
    }
    return undefined;
  };

  const informationalText: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: getEmailAuthenticatorSubtitle(
        redactedEmailAddress,
        redactedSecondaryEmailAddress,
        useEmailMagicLink,
        getTokenReplacement(),
      ),
    },
  };

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
    informationalText,
    passcodeElement!,
    submitButtonElement,
  ];

  // If Email Magic link is disabled, render single form instead of stepper
  if (!useEmailMagicLink) {
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
          informationalText,
          showCodeStepperButton,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 })),
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: codeEntryDisplayElements.map(
          (ele: UISchemaElement) => ({ ...ele, viewIndex: 1 }),
        ),
      } as UISchemaLayout,
    ],
  };

  uischema.elements = [stepper];

  return formBag;
};

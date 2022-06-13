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

import { ControlElement, Layout } from '@jsonforms/core';

import {
  DescriptionElement,
  IdxStepTransformer,
  LayoutType,
  ReminderElement,
  StepperLayout,
  StepperNavButtonConfigAttrs,
  StepperNavButtonConfigDirection,
  TitleElement,
  Undefinable,
} from '../../types';
import { ButtonOptionType } from '../getButtonControls';
import { getCurrentTimestamp, removeUIElementWithScope } from '../utils';

const TARGET_SCOPE = '#/properties/credentials/properties/passcode';

export const transformEmailChallenge: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep, availableSteps } = transaction;
  const { uischema } = formBag;

  uischema.elements = removeUIElementWithScope(TARGET_SCOPE, uischema.elements as ControlElement[]);

  let reminderElement: Undefinable<ReminderElement>;

  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (nextStep.canResend && resendStep) {
    const { action } = resendStep;
    reminderElement = {
      type: 'Reminder',
      options: {
        ctaText: 'email.code.not.received',
        action,
      },
    };
  }

  const verificationCodeElement: ControlElement = {
    type: 'Control',
    label: 'email.enroll.enterCode',
    scope: TARGET_SCOPE,
  };

  // @ts-ignore Remove after https://oktainc.atlassian.net/browse/OKTA-502429
  const redactedEmailAddress = nextStep.relatesTo?.value?.profile?.email;
  const informationalText: DescriptionElement = {
    type: 'Description',
    options: {
      content: redactedEmailAddress
        ? 'next.email.challenge.informationalTextWithEmail'
        : 'next.email.challenge.informationalText',
      contentParams: [
        redactedEmailAddress,
      ],
    },
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.email.mfa.title',
    },
  };

  const submitButtonControl: ControlElement = {
    type: 'Control',
    label: 'mfa.challenge.verify',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
    },
  };

  const emailChallengeStepper: StepperLayout = {
    type: LayoutType.STEPPER,
    elements: [
      {
        type: LayoutType.VERTICAL,
        elements: [
          reminderElement,
          titleElement,
          informationalText,
        ].filter(Boolean),
      } as Layout,
      {
        type: LayoutType.VERTICAL,
        elements: [
          reminderElement,
          titleElement,
          informationalText,
          verificationCodeElement,
          submitButtonControl,
        ].filter(Boolean),
      } as Layout,
    ],
    options: {
      key: `${getCurrentTimestamp()}-emailChallenge`,
      navButtonsConfig: {
        next: {
          label: 'oie.email.verify.alternate.showCodeTextField',
          variant: 'secondary',
        },
      } as Record<StepperNavButtonConfigDirection, StepperNavButtonConfigAttrs>,
    },
  };

  uischema.elements.unshift(emailChallengeStepper);

  return formBag;
};

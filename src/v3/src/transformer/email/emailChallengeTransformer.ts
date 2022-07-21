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

import { IdxActionParams } from '@okta/okta-auth-js';
import { loc } from 'okta';

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  ReminderElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { getUIElementWithName, removeUIElementWithName } from '../utils';

const TARGET_ELEMENT_KEY = 'credentials.passcode';

export const transformEmailChallenge: IdxStepTransformer = (transaction, formBag, widgetProps) => {
  const { nextStep, availableSteps } = transaction;
  const { uischema } = formBag;
  const { authClient } = widgetProps;

  const passcodeElement = getUIElementWithName(
    TARGET_ELEMENT_KEY,
    uischema.elements as UISchemaElement[],
  );
  uischema.elements = removeUIElementWithName(
    TARGET_ELEMENT_KEY,
    uischema.elements as UISchemaElement[],
  );

  let reminderElement: ReminderElement | undefined;
  let verificationCodeElement: FieldElement | undefined;

  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (nextStep.canResend && resendStep) {
    const { name } = resendStep;
    reminderElement = {
      type: 'Reminder',
      options: {
        ctaText: loc('email.code.not.received', 'login'),
        // @ts-ignore OKTA-512706 temporary until auth-js applies this fix
        action: (params?: IdxActionParams) => {
          const { stateHandle, ...rest } = params ?? {};
          return authClient?.idx.proceed({
            // @ts-ignore stateHandle can be undefined
            stateHandle,
            actions: [{ name, params: rest }],
          });
        },
      },
    };
  }

  if (passcodeElement) {
    verificationCodeElement = {
      ...passcodeElement as FieldElement,
      label: loc('email.enroll.enterCode', 'login'),
    };
  }

  const redactedEmailAddress = nextStep.relatesTo?.value?.profile?.email;
  // TODO: revisit this to use oie i18n strings (AuthenticatorEmailViewUtil.js)
  const informationalText: DescriptionElement = {
    type: 'Description',
    options: {
      content: redactedEmailAddress
        ? loc('next.email.challenge.informationalTextWithEmail', 'login', [redactedEmailAddress])
        : loc('next.email.challenge.informationalText', 'login'),
    },
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.email.mfa.title', 'login'),
    },
  };

  const submitButtonControl: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
    },
  };

  const emailChallengeStepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          reminderElement,
          titleElement,
          informationalText,
          {
            type: 'StepperButton',
            label: loc('oie.email.verify.alternate.showCodeTextField', 'login'),
            options: {
              variant: 'secondary',
              nextStepIndex: 1,
            },
          } as StepperButtonElement,
        ].filter(Boolean),
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          reminderElement,
          titleElement,
          informationalText,
          verificationCodeElement,
          submitButtonControl,
        ].filter(Boolean),
      } as UISchemaLayout,
    ],
  };

  uischema.elements.unshift(emailChallengeStepper);

  return formBag;
};

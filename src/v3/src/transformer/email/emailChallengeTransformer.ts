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

import { IdxActionParams, NextStep } from '@okta/okta-auth-js';

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  ReminderElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName } from '../utils';

export const transformEmailChallenge: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { uischema } = formBag;
  const { authClient } = widgetProps;

  let reminderElement: ReminderElement | undefined;

  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (resendStep) {
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

  const passcodeElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  );
  passcodeElement!.label = loc('email.enroll.enterCode', 'login');

  const redactedEmailAddress = nextStep.relatesTo?.value?.profile?.email;
  const informationalText: DescriptionElement = {
    type: 'Description',
    options: {
      content: redactedEmailAddress
        ? loc('oie.email.verify.alternate.magicLinkToEmailAddress', 'login', [redactedEmailAddress])
        : loc('oie.email.verify.alternate.magicLinkToYourEmail', 'login'),
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

  const showCodeStepperButton: StepperButtonElement = {
    type: 'StepperButton',
    label: loc('oie.email.verify.alternate.showCodeTextField', 'login'),
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
        ],
      } as UISchemaLayout,
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          ...(reminderElement ? [reminderElement] : []),
          titleElement,
          informationalText,
          passcodeElement,
          submitButtonControl,
        ],
      } as UISchemaLayout,
    ],
  };

  uischema.elements = [stepper];

  return formBag;
};

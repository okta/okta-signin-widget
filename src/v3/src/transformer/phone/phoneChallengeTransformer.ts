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
  TitleElement,
} from '../../types';
import { buildPhoneVerificationSubtitleElement, isValidPhoneMethodType, loc } from '../../util';

export const transformPhoneChallenge: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { uischema } = formBag;

  const { methods } = nextStep.relatesTo?.value || {};
  const methodType = methods?.[0]?.type;
  let reminderElement: ReminderElement | undefined;

  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  const isSmsMethodType = methodType === 'sms';
  if (resendStep) {
    const { name } = resendStep;
    reminderElement = {
      type: 'Reminder',
      options: {
        content: isSmsMethodType
          ? loc('oie.phone.verify.sms.resendText', 'login')
          : loc('oie.phone.verify.call.resendText', 'login'),
        buttonText: isSmsMethodType
          ? loc('oie.phone.verify.sms.resendLinkText', 'login')
          : loc('oie.phone.verify.call.resendLinkText', 'login'),
        step: name,
        isActionStep: true,
        actionParams: { resend: true },
      },
    };
  }

  const carrierChargeDisclaimerText: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.phone.carrier.charges', 'login'),
    },
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.phone.verify.title', 'login'),
    },
  };

  const submitButtonControl: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements.push(submitButtonControl);
  uischema.elements.unshift(carrierChargeDisclaimerText);
  if (isValidPhoneMethodType(methodType)) {
    uischema.elements.unshift(
      buildPhoneVerificationSubtitleElement(
        nextStep.name,
        methodType,
        nextStep.relatesTo?.value,
      ),
    );
  }
  uischema.elements.unshift(titleElement);
  if (reminderElement) {
    uischema.elements.unshift(reminderElement);
  }

  return formBag;
};

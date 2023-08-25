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
import { loc } from '../../util';

export const transformPhoneCodeEnrollment: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { uischema } = formBag;

  let reminderElement: ReminderElement | undefined;

  const { methods, profile } = nextStep.relatesTo?.value || {};
  const { phoneNumber } = profile || {};
  const methodType = methods?.[0]?.type;
  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  const smsMethodType = methodType === 'sms';
  if (resendStep) {
    const { name } = resendStep;
    reminderElement = {
      type: 'Reminder',
      options: {
        content: smsMethodType ? loc('oie.phone.verify.sms.resendText', 'login') : loc('oie.phone.verify.call.resendText', 'login'),
        buttonText: smsMethodType ? loc('oie.phone.verify.sms.resendLinkText', 'login') : loc('oie.phone.verify.call.resendLinkText', 'login'),
        step: name,
        isActionStep: true,
        actionParams: { resend: true },
      },
    };
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.phone.enroll.title', 'login'),
    },
  };
  const sendInfoText = smsMethodType
    ? loc('oie.phone.verify.sms.codeSentText', 'login')
    : loc('mfa.calling', 'login');
  // using the &lrm; unicode mark to keep the phone number in ltr format, while maintaining rtl punctuation (period)
  // https://www.w3.org/TR/WCAG20-TECHS/H34.html
  const phoneNumberSpan = phoneNumber ? `<span class="strong no-translate">&lrm;${phoneNumber}.</span>` : null;
  const phoneInfoText = phoneNumberSpan || `${loc('oie.phone.alternate.title', 'login')}.`;
  const enterCodeInfoText = loc('oie.phone.verify.enterCodeText', 'login');
  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: `${sendInfoText} ${phoneInfoText} ${enterCodeInfoText}`,
    },
  };

  const carrierChargeDisclaimerText: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.phone.carrier.charges', 'login'),
    },
  };

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  // Element order matters for display purposes:
  // 1. Title 2. Description ... Button is last element
  uischema.elements.unshift(carrierChargeDisclaimerText);
  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitButton);
  if (reminderElement) {
    uischema.elements.unshift(reminderElement);
  }

  return formBag;
};

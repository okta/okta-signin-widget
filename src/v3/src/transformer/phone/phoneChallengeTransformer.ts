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
  IdxStepTransformer,
  ReminderElement,
  TitleElement,
  Undefinable,
} from '../../types';

export const transformPhoneChallenge: IdxStepTransformer = (
  transaction,
  formBag,
  widgetProps,
) => {
  const { nextStep: { canResend, relatesTo }, availableSteps } = transaction;
  const { uischema } = formBag;
  const { authClient } = widgetProps;

  let reminderElement: Undefinable<ReminderElement>;

  const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
  if (canResend && resendStep) {
    const { name } = resendStep;
    reminderElement = {
      type: 'Reminder',
      options: {
        ctaText: loc('oie.phone.verify.sms.resendText', 'login'),
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

  const redactedPhone = relatesTo?.value?.profile?.phoneNumber as string;
  const informationalText: DescriptionElement = {
    type: 'Description',
    options: {
      // TODO: revisit this for oie i18n string (ChallengeAuthenticatorPhoneView.js)
      content: redactedPhone
        ? loc('next.phone.challenge.sms.informationalTextWithPhone', 'login', [redactedPhone])
        : loc('next.phone.challenge.sms.informationalText', 'login'),
    },
  };

  const carrierChargeDisclaimerText: DescriptionElement = {
    type: 'Description',
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
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
    },
  };

  uischema.elements.push(submitButtonControl);
  uischema.elements.unshift(carrierChargeDisclaimerText);
  uischema.elements.unshift(informationalText);
  uischema.elements.unshift(titleElement);
  if (reminderElement) {
    uischema.elements.unshift(reminderElement);
  }

  return formBag;
};

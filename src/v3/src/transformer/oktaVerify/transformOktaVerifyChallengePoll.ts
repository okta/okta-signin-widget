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

import PhoneSvg from '../../img/phone-icon.svg';
import {
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  ImageWithTextElement,
  ReminderElement,
  SpinnerElement,
  TitleElement,
} from '../../types';
import { loc } from '../../util';
import { transformOktaVerifyDeviceChallengePoll } from '../layout/oktaVerify';
import { getUIElementWithName } from '../utils';

export const transformOktaVerifyChallengePoll: IdxStepTransformer = (options) => {
  const { transaction, formBag } = options;
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { relatesTo } = nextStep;
  const { uischema, data } = formBag;

  const [selectedMethod] = relatesTo?.value?.methods || [];
  if (!selectedMethod) {
    return formBag;
  }

  if (selectedMethod.type === 'push') {
    // Need to initialize autoChallenge checkbox if it is set otherwise it will not display in UI
    const autoChallenge = getUIElementWithName('autoChallenge', uischema.elements) as FieldElement;
    data.autoChallenge = autoChallenge?.options?.inputMeta?.value;

    // @ts-ignore OKTA-496373 correctAnswer is missing from interface
    const correctAnswer = relatesTo?.value?.contextualData?.correctAnswer;

    if (correctAnswer) {
      uischema.elements.unshift({
        type: 'Title',
        options: { content: loc('oie.okta_verify.push.sent', 'login') },
      } as TitleElement);

      const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
      if (resendStep) {
        const { name } = resendStep;
        uischema.elements.unshift({
          type: 'Reminder',
          options: {
            content: loc('oie.numberchallenge.warning', 'login'),
            buttonText: loc('email.button.resend', 'login'),
            step: name,
            isActionStep: true,
            actionParams: { resend: true },
          },
        } as ReminderElement);
      }

      const phoneIconImage: ImageWithTextElement = {
        type: 'ImageWithText',
        options: {
          id: 'code',
          SVGIcon: PhoneSvg,
          textContent: correctAnswer,
        },
      };

      const description: DescriptionElement = {
        type: 'Description',
        options: {
          content: loc('oie.numberchallenge.instruction', 'login', [correctAnswer]),
        },
      };

      uischema.elements.push(description);
      uischema.elements.push(phoneIconImage);
      uischema.elements.push({
        type: 'Spinner',
        options: {
          // TODO: OKTA-518793 - replace english string with key once created
          label: 'Loading...',
          valueText: 'Loading...',
        },
      } as SpinnerElement);
    } else {
      uischema.elements.unshift({
        type: 'Reminder',
        options: {
          content: loc('oktaverify.warning', 'login'),
        },
      } as ReminderElement);
      uischema.elements.unshift({
        type: 'Title',
        options: { content: loc('oie.okta_verify.push.title', 'login') },
      } as TitleElement);
      uischema.elements.push({
        type: 'Description',
        options: { content: loc('oie.okta_verify.push.sent', 'login') },
      } as DescriptionElement);
      uischema.elements.push({
        type: 'Spinner',
        options: {
          // TODO: OKTA-518793 - replace english string with key once created
          label: 'Loading...',
          valueText: 'Loading...',
        },
      } as SpinnerElement);
    }
  } else if (selectedMethod.type === 'signed_nonce') {
    // selectedMethod.type === 'signed_nonce' reflects a FastPass OV flow
    return transformOktaVerifyDeviceChallengePoll(options);
  }

  return formBag;
};

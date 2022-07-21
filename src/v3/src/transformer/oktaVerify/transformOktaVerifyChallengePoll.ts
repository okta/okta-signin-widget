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
import { loc } from 'okta';

import PhoneSvg from '../../img/phone-icon.svg';
import {
  DescriptionElement,
  IdxStepTransformer,
  ImageWithTextElement,
  ReminderElement,
  SpinnerElement,
  TitleElement,
} from '../../types';

export const transformOktaVerifyChallengePoll: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { relatesTo } = nextStep;
  const { uischema } = formBag;
  const { authClient } = widgetProps;

  const [selectedMethod] = relatesTo?.value?.methods || [];
  if (!selectedMethod) {
    return formBag;
  }

  // @ts-ignore OKTA-496373 correctAnswer is missing from interface
  const correctAnswer = relatesTo?.value?.contextualData?.correctAnswer;
  if (selectedMethod.type === 'push' && correctAnswer) {
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
          // TODO: revisit to use oie i18n string (ResendNumberChallengeView.js)
          ctaText: loc('next.numberchallenge.warning', 'login'),
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
      // TODO: revisit to use oie i18n string (NumberChallengePhoneView.js)
      options: { content: loc('next.numberchallenge.instruction', 'login', [correctAnswer]) },
    };

    uischema.elements.push(description);
    uischema.elements.push(phoneIconImage);
    uischema.elements.push({
      type: 'Spinner',
      options: {
        label: loc('loading.label', 'login'),
        valueText: loc('loading.label', 'login'),
      },
    } as SpinnerElement);
  } else if (selectedMethod.type === 'push') {
    uischema.elements.unshift({
      type: 'Reminder',
      options: {
        ctaText: loc('oktaverify.warning', 'login'),
        excludeLink: true,
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
        label: loc('loading.label', 'login'),
        valueText: loc('loading.label', 'login'),
      },
    } as SpinnerElement);
  }

  return formBag;
};

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

import PhoneSvg from '../../img/phone-icon.svg';
import {
  DescriptionElement,
  IdxStepTransformer,
  ImageWithTextElement,
  ReminderElement,
  SpinnerElement,
  TitleElement,
} from '../../types';

export const transformOktaVerifyChallengePoll: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep } = transaction;
  const { canResend, relatesTo } = nextStep;
  const { uischema } = formBag;

  const [selectedMethod] = relatesTo?.value?.methods || [];
  if (!selectedMethod) {
    return formBag;
  }

  // @ts-ignore OKTA-496373 correctAnswer is missing from interface
  const correctAnswer = relatesTo?.value?.contextualData?.correctAnswer;
  if (selectedMethod.type === 'push' && correctAnswer) {
    uischema.elements.unshift({
      type: 'Title',
      options: { content: 'oie.okta_verify.push.sent' },
    } as TitleElement);

    if (canResend) {
      uischema.elements.unshift({
        type: 'Reminder',
        options: {
          ctaText: 'next.numberchallenge.warning',
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
      options: { content: 'next.numberchallenge.instruction', contentParams: [correctAnswer] },
    };

    uischema.elements.push(description);
    uischema.elements.push(phoneIconImage);
    uischema.elements.push({
      type: 'Spinner',
      options: {
        label: 'loading.label',
        valueText: 'loading.label',
      },
    } as SpinnerElement);
  } else if (selectedMethod.type === 'push') {
    uischema.elements.unshift({
      type: 'Reminder',
      options: {
        ctaText: 'oktaverify.warning',
        excludeLink: true,
      },
    } as ReminderElement);
    uischema.elements.unshift({
      type: 'Title',
      options: { content: 'oie.okta_verify.push.title' },
    } as TitleElement);
    uischema.elements.push({
      type: 'Description',
      options: { content: 'oie.okta_verify.push.sent' },
    } as DescriptionElement);
    uischema.elements.push({
      type: 'Spinner',
      options: {
        label: 'loading.label',
        valueText: 'loading.label',
      },
    } as SpinnerElement);
  }

  return formBag;
};

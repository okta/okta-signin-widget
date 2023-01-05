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

import { IDX_STEP } from '../../../constants';
import {
  DescriptionElement,
  IdxStepTransformer,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformOktaVerifyDeviceChallengePoll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep = {} as NextStep } = transaction;
  const { uischema } = formBag;

  const deviceChallengePayload = transaction.nextStep?.name === IDX_STEP.DEVICE_CHALLENGE_POLL
    ? transaction.nextStep?.relatesTo?.value
    // @ts-expect-error challenge is not defined on contextualData
    : transaction.nextStep?.relatesTo?.value?.contextualData?.challenge?.value;

  uischema.elements.unshift({
    type: 'Title',
    options: { content: loc('customUri.title', 'login') },
  } as TitleElement);

  uischema.elements.push({
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('customUri.required.content.prompt', 'login') },
  } as DescriptionElement);

  uischema.elements.push({
    type: 'OpenOktaVerifyFPButton',
    options: {
      step: nextStep.name,
      href: deviceChallengePayload.href,
    },
  } as OpenOktaVerifyFPButtonElement);

  uischema.elements.push({
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('customUri.required.content.download.title', 'login') },
  } as DescriptionElement);

  uischema.elements.push({
    type: 'Link',
    options: {
      label: loc('customUri.required.content.download.linkText', 'login'),
      href: deviceChallengePayload.downloadHref
    },
  } as LinkElement);

  return formBag;
};

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

import { CHALLENGE_METHOD, IDX_STEP } from '../../../constants';
import {
  DescriptionElement,
  IdxStepTransformer,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  SpinnerElement,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

const getTitleText = (challengeMethod = CHALLENGE_METHOD.CUSTOM_URI) => {
  if (challengeMethod === CHALLENGE_METHOD.APP_LINK) {
    return loc('appLink.title', 'login');
  } if (challengeMethod === CHALLENGE_METHOD.UNIVERSAL_LINK) {
    return loc('universalLink.title', 'login');
  }
  return loc('customUri.title', 'login');
};

const getDescriptionText = (challengeMethod = CHALLENGE_METHOD.CUSTOM_URI) => {
  if (challengeMethod === CHALLENGE_METHOD.APP_LINK) {
    return loc('appLink.content', 'login');
  } if (challengeMethod === CHALLENGE_METHOD.UNIVERSAL_LINK) {
    return loc('universalLink.content', 'login');
  }
  return loc('customUri.required.content.prompt', 'login');
};

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

  const { challengeMethod } = deviceChallengePayload;
  uischema.elements.unshift({
    type: 'Title',
    options: {
      content: getTitleText(challengeMethod),
    },
  } as TitleElement);

  if (challengeMethod === CHALLENGE_METHOD.APP_LINK
    || challengeMethod === CHALLENGE_METHOD.UNIVERSAL_LINK) {
    uischema.elements.push({
      type: 'Spinner',
    } as SpinnerElement);
  }

  uischema.elements.push({
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: getDescriptionText(challengeMethod),
    },
  } as DescriptionElement);

  uischema.elements.push({
    type: 'OpenOktaVerifyFPButton',
    options: {
      step: nextStep.name,
      href: deviceChallengePayload.href,
      challengeMethod,
    },
  } as OpenOktaVerifyFPButtonElement);

  if (challengeMethod === CHALLENGE_METHOD.CUSTOM_URI) {
    uischema.elements.push({
      type: 'Description',
      contentType: 'subtitle',
      options: { content: loc('customUri.required.content.download.title', 'login') },
    } as DescriptionElement);

    uischema.elements.push({
      type: 'Link',
      options: {
        label: loc('customUri.required.content.download.linkText', 'login'),
        href: deviceChallengePayload.downloadHref,
      },
    } as LinkElement);
  }

  return formBag;
};

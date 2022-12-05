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
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  LinkElement,
  OpenOktaVerifyButtonElement,
  TitleElement,
} from '../../../types';
// import { loc } from '../../../util';

export const transformOktaVerifyDeviceChallengePoll: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { relatesTo } = nextStep;
  const { uischema } = formBag;

  uischema.elements.unshift({
    type: 'Title',
    options: { content: 'Click "Open Okta Verify" on the browser prompt' },
  } as TitleElement);

  uischema.elements.push({
    type: 'Description',
    options: { content: "Didn't get a prompt?" },
  } as DescriptionElement);

  uischema.elements.push({
    type: 'OpenOktaVerifyButton',
    options: {
      step: IDX_STEP.DEVICE_CHALLENGE_POLL,
      // @ts-expect-error ts(2339) Property 'href' does not exist on type 'IdxAuthenticator'.
      href: relatesTo?.value.href,
    },
  } as OpenOktaVerifyButtonElement);

  uischema.elements.push({
    type: 'Description',
    options: { content: "Don't have Okta Verify?" },
  } as DescriptionElement);

  uischema.elements.push({
    type: 'Link',
    options: {
      label: 'Download here',
      // @ts-expect-error ts(2339) Property 'downloadHref' does not exist on type 'IdxAuthenticator'.
      href: relatesTo?.value.downloadHref
    }
  } as LinkElement);

  return formBag;
};

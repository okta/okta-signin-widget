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
  IdxStepTransformer,
  LoopbackProbeElement,
  SpinnerElement,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformOktaVerifyFPLoopbackPoll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep = {} as NextStep } = transaction;
  const { relatesTo } = nextStep;
  const { uischema } = formBag;

  uischema.elements.unshift({
    type: 'Title',
    options: { content: loc('deviceTrust.sso.redirectText', 'login') },
  } as TitleElement);

  uischema.elements.push({
    type: 'Spinner',
  } as SpinnerElement);

  uischema.elements.unshift({
    type: 'LoopbackProbe',
    options: {
      // @ts-expect-error ports is not defined on value
      ports: relatesTo?.value.ports,
      // @ts-expect-error ports is not defined on value
      domain: relatesTo?.value.domain,
      // @ts-expect-error ports is not defined on value
      challengeRequest: relatesTo?.value.challengeRequest,
    },
  } as LoopbackProbeElement);

  return formBag;
};

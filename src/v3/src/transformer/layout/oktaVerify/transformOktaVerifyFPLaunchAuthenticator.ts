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

import { IDX_STEP } from '../../../constants';
import {
  DescriptionElement,
  IdxStepTransformer,
  LaunchAuthenticatorButtonElement,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformOktaVerifyFPLaunchAuthenticator: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  const { uischema } = formBag;
  const { context } = transaction;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('primaryauth.title', 'login'),
    },
  };

  const appLabel = context?.app?.value?.label;
  const resourceLabel = appLabel ? loc('oktaVerify.appDescription', 'login', [appLabel])
    : loc('oktaVerify.description', 'login');
  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: resourceLabel,
    },
  };

  const launchAuthenticatorButton: LaunchAuthenticatorButtonElement = {
    type: 'LaunchAuthenticatorButton',
    label: loc('oktaVerify.button', 'login'),
    options: {
      step: IDX_STEP.LAUNCH_AUTHENTICATOR,
      // @ts-expect-error authenticatorChallenge missing from transaction context type
      deviceChallengeUrl: context?.authenticatorChallenge?.value?.href,
      // @ts-expect-error authenticatorChallenge missing from transaction context type
      challengeMethod: context?.authenticatorChallenge?.value?.challengeMethod,
    },
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    launchAuthenticatorButton,
  ];

  return formBag;
};

/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IDX_STEP } from '../../constants';
import {
  DescriptionElement,
  IdxStepTransformer,
  LaunchAuthenticatorButtonElement,
  TitleElement,
} from '../../types';
import { loc } from '../../util';
// TEMPORARY DEBUG — OKTA-1250822. Remove with util/nfcDebug.ts.
import { nfcDebugLog } from '../../util/nfcDebug';

/**
 * NFC PIN launch authenticator transformer.
 * Renders the "Sign in with NFC" button on the identify page.
 */
export const transformNfcPinLaunchAuthenticator: IdxStepTransformer = ({
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

  // @ts-expect-error authenticatorChallenge missing from transaction context type
  const launchChallengeHref = context?.authenticatorChallenge?.value?.href;
  // @ts-expect-error authenticatorChallenge missing from transaction context type
  const launchChallengeMethod = context?.authenticatorChallenge?.value?.challengeMethod;

  // TEMPORARY DEBUG — OKTA-1250822.
  // The challenge placed on the "Sign in with NFC" button ("challenge A"). Compare its jti
  // to the poll screen's challenge ("challenge B") logged by transformNfcPinDeviceChallenge.
  nfcDebugLog('transformNfcPinLaunchAuthenticator sets launch challenge', {
    challengeMethod: launchChallengeMethod,
    href: launchChallengeHref,
  });

  const launchAuthenticatorButton: LaunchAuthenticatorButtonElement = {
    type: 'LaunchAuthenticatorButton',
    label: loc('oie.nfc_pin.launch.button', 'login'),
    options: {
      step: IDX_STEP.LAUNCH_NFC_AUTHENTICATOR,
      deviceChallengeUrl: launchChallengeHref,
      challengeMethod: launchChallengeMethod,
      i18nKey: 'oie.nfc_pin.launch.button',
    },
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    launchAuthenticatorButton,
  ];

  return formBag;
};

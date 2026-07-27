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

import { CHALLENGE_METHOD, IDX_STEP } from '../../constants';
import {
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  TitleElement,
} from '../../types';
import { hasMinAuthenticatorOptions, loc } from '../../util';
import { getUIElementWithName } from '../utils';
import { transformNfcPinCreate } from './transformNfcPinCreate';

/**
 * Phase 1 (device challenge polling) — OV auto-launches via setupNfcUrl.
 * Shows the standard "Click Open Okta Verify on the browser prompt" screen
 * while SIW polls for card enrollment completion.
 */
const transformDeviceChallengePoll: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema } = formBag;

  const contextualData = transaction.rawIdxState?.currentAuthenticator?.value?.contextualData;
  const setupNfcUrl = contextualData?.setupNfcUrl;

  // NFC-specific intermediate screen for enrollment
  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.enroll.nfc_pin.title', 'login'),
    },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.enroll.nfc_pin.instructions', 'login'),
    },
  };

  // "Open Okta Verify" button as manual fallback
  const openOktaVerifyButton: OpenOktaVerifyFPButtonElement = {
    type: 'OpenOktaVerifyFPButton',
    options: {
      step: transaction.nextStep!.name,
      href: setupNfcUrl,
      challengeMethod: CHALLENGE_METHOD.CUSTOM_URI,
    },
  };

  // "Return to authenticator list" link (conditional)
  const hasEnrollOptions = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    1,
  );
  const selectEnrollStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_ENROLL);
  const returnToListLink: LinkElement | undefined = (selectEnrollStep && hasEnrollOptions)
    ? {
      type: 'Link',
      contentType: 'footer',
      options: {
        label: loc('oie.enroll.switch.authenticator', 'login'),
        dataSe: 'switchAuthenticator',
        step: selectEnrollStep.name,
      },
    } : undefined;

  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: 'cancel',
    },
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    openOktaVerifyButton,
    ...(returnToListLink ? [returnToListLink] : []),
    cancelLink,
  ];

  return formBag;
};

/**
 * NFC PIN enrollment transformer.
 * Handles two phases:
 * - Phase 1 (has setupNfcUrl, no passcode): Device challenge — auto-launches OV via CUS, polls
 * - Phase 2 (has passcode field): PIN creation — "Choose a PIN" with requirements
 */
export const transformNfcPinEnroll: IdxStepTransformer = (params) => {
  const { formBag } = params;

  // Phase 2: PIN creation (credentials.passcode field exists)
  const passcodeElement = getUIElementWithName(
    'credentials.passcode',
    formBag.uischema.elements as FieldElement[],
  );
  if (passcodeElement) {
    return transformNfcPinCreate(params);
  }

  // Phase 1: Device challenge (go directly, no setup instructions screen)
  return transformDeviceChallengePoll(params);
};

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

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  TitleElement,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName } from '../utils';
import { transformNfcPinCreate } from './transformNfcPinCreate';

/**
 * Determines if the enrollment response includes the OV launch URL (polling phase)
 * or is the initial setup screen.
 */
const isDeviceChallengePhase = (transaction: Parameters<IdxStepTransformer>[0]['transaction']): boolean => {
  // @ts-expect-error contextualData is not fully typed
  const contextualData = transaction.nextStep?.relatesTo?.value?.contextualData;
  return !!contextualData?.setupNfcUrl;
};

/**
 * Phase 1: Setup instructions — "Set up NFC" with button to proceed.
 */
const transformSetupInstructions: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.enroll.nfc_pin.title', 'login'),
    },
  };

  const instructionsElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.enroll.nfc_pin.instructions', 'login'),
    },
  };

  const openOktaVerifyButton: ButtonElement = {
    type: 'Button',
    label: loc('oie.enroll.nfc_pin.openOktaVerify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements = [
    titleElement,
    instructionsElement,
    openOktaVerifyButton,
  ];

  return formBag;
};

/**
 * Phase 2: Device challenge polling — OV auto-launches via setupNfcUrl.
 * Shows the standard "Click Open Okta Verify on the browser prompt" screen
 * while SIW polls for card enrollment completion.
 */
const transformDeviceChallengePoll: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema } = formBag;

  // @ts-expect-error contextualData is not fully typed
  const setupNfcUrl = transaction.nextStep?.relatesTo?.value?.contextualData?.setupNfcUrl;
  const downloadHref = 'https://apps.apple.com/us/app/okta-verify/id490179405';

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('customUri.title', 'login'),
    },
  };

  const promptElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('customUri.required.content.prompt', 'login'),
    },
  };

  const openOktaVerifyButton: OpenOktaVerifyFPButtonElement = {
    type: 'OpenOktaVerifyFPButton',
    options: {
      step: transaction.nextStep!.name,
      href: setupNfcUrl,
      challengeMethod: 'CUSTOM_URI',
    },
  };

  const downloadTitle: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('customUri.required.content.download.title', 'login'),
    },
  };

  const downloadLink: LinkElement = {
    type: 'Link',
    options: {
      label: loc('customUri.required.content.download.linkText', 'login'),
      href: downloadHref,
      step: '',
    },
  };

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
    promptElement,
    openOktaVerifyButton,
    downloadTitle,
    downloadLink,
    cancelLink,
  ];

  return formBag;
};

/**
 * NFC PIN enrollment transformer.
 * Handles three phases:
 * - Phase 1 (no setupNfcUrl, no passcode): "Set up NFC" instructions + "Open Okta Verify" button
 * - Phase 2 (has setupNfcUrl): Device challenge polling — auto-launches OV, polls
 * - Phase 3 (has passcode field): PIN creation — "Choose a PIN" with requirements
 */
export const transformNfcPinEnroll: IdxStepTransformer = (params) => {
  const { transaction, formBag } = params;

  // Phase 3: PIN creation (credentials.passcode field exists)
  const passcodeElement = getUIElementWithName(
    'credentials.passcode',
    formBag.uischema.elements as FieldElement[],
  );
  if (passcodeElement) {
    return transformNfcPinCreate(params);
  }

  // Phase 2: Device challenge (setupNfcUrl exists)
  if (isDeviceChallengePhase(transaction)) {
    return transformDeviceChallengePoll(params);
  }

  // Phase 1: Setup instructions
  return transformSetupInstructions(params);
};

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

import { IdxStepTransformer } from '../../types';
import { transformNfcPinDeviceChallenge } from './transformNfcPinDeviceChallenge';
import { transformNfcPinVerify } from './transformNfcPinVerify';

/**
 * Determines whether the current IDX response is in the device challenge phase
 * or the PIN entry phase.
 *
 * Device challenge: `contextualData.challenge` exists (OV needs to handle NFC scan)
 * PIN entry: `credentials.form.value` has the `passcode` field
 */
const isDeviceChallengePhase = (transaction: Parameters<IdxStepTransformer>[0]['transaction']): boolean => {
  // @ts-expect-error contextualData is not fully typed
  const contextualData = transaction.nextStep?.relatesTo?.value?.contextualData;
  return !!contextualData?.challenge;
};

/**
 * NFC PIN challenge transformer (router).
 * Delegates to the appropriate transformer based on the IDX response:
 * - Device challenge: launch OV, show custom_uri screen, poll
 * - PIN entry: show "Enter PIN" screen after NFC card verified
 */
export const transformNfcPinChallenge: IdxStepTransformer = (params) => {
  if (isDeviceChallengePhase(params.transaction)) {
    return transformNfcPinDeviceChallenge(params);
  }
  return transformNfcPinVerify(params);
};

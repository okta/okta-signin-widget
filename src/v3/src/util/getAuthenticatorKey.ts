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

import { IdxTransaction } from '@okta/okta-auth-js';

import { IDX_STEP } from '../constants';

// TODO: OKTA-503490 temporary sln to fix issue with missing relatesTo obj
export const STEPS_MISSING_RELATES_TO: string[] = [
  IDX_STEP.ENROLL_POLL,
  IDX_STEP.ENROLLMENT_CHANNEL_DATA,
  IDX_STEP.DEVICE_APPLE_SSO_EXTENSION,
];

export const getAuthenticatorKey = (
  transaction: IdxTransaction,
): string | undefined => {
  const { nextStep: { name: stepName = '', relatesTo } = {}, context } = transaction;
  if (stepName === IDX_STEP.DEVICE_CHALLENGE_POLL) {
    // @ts-expect-error ts(2339) Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
    return relatesTo?.value?.challengeMethod;
  }
  if (STEPS_MISSING_RELATES_TO.includes(stepName)) {
    return context.currentAuthenticator?.value?.key;
  }
  // TODO: OKTA-503490 temporary sln to grab auth key for enroll-poll step its missing relatesTo obj
  return relatesTo?.value?.key;
};

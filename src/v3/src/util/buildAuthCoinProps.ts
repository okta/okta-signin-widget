/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

import {
  AUTHENTICATOR_KEY, DEVICE_ENROLLMENT_TYPE, EMAIL_AUTHENTICATOR_TERMINAL_KEYS, IDX_STEP,
} from '../constants';
import { AuthCoinProps } from '../types';
import { getAuthenticatorKey } from './getAuthenticatorKey';
import { containsOneOfMessageKeys } from './idx';

export const buildAuthCoinProps = (
  transaction?: IdxTransaction | null,
): AuthCoinProps | undefined => {
  if (!transaction) {
    return undefined;
  }

  const { nextStep, messages } = transaction;
  if (containsOneOfMessageKeys(EMAIL_AUTHENTICATOR_TERMINAL_KEYS, messages)
    || nextStep?.name === IDX_STEP.CONSENT_EMAIL_CHALLENGE) {
    return { authenticatorKey: AUTHENTICATOR_KEY.EMAIL };
  }

  if (nextStep?.name === IDX_STEP.PIV_IDP) {
    return { authenticatorKey: IDX_STEP.PIV_IDP };
  }

  if (nextStep?.name === IDX_STEP.REDIRECT_IDVERIFY && nextStep?.idp?.id) {
    return { authenticatorKey: nextStep.idp.id };
  }

  // @ts-expect-error Property 'deviceEnrollment' does not exist on type 'IdxContext' ts(2339)
  if (transaction.context?.deviceEnrollment?.value?.name === DEVICE_ENROLLMENT_TYPE.ODA) {
    return { authenticatorKey: AUTHENTICATOR_KEY.OV };
  }

  const authenticatorKey = getAuthenticatorKey(transaction);
  if (authenticatorKey) {
    return {
      authenticatorKey,
      // @ts-ignore logoUri missing from interface
      url: nextStep?.relatesTo?.value.logoUri,
    };
  }

  return undefined;
};

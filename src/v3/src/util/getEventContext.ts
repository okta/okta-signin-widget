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

import { EventContext } from '../../../types';
import { getV1ClassName } from '../../../v2/ion/ViewClassNamesFactory';
import { getAuthenticatorKey } from './getAuthenticatorKey';
import { isPasswordRecovery } from './isPasswordRecovery';

export const getEventContext = (transaction: IdxTransaction): EventContext => {
  const { nextStep: { name: formName } = {}, context } = transaction;
  const authenticatorKey = context.currentAuthenticator?.value?.key
    || getAuthenticatorKey(transaction);
  const methodType = transaction.context.currentAuthenticator?.value?.type;
  const isPasswordRecoveryFlow = isPasswordRecovery(transaction);

  const controller = getV1ClassName(
    formName,
    authenticatorKey,
    methodType,
    isPasswordRecoveryFlow,
  );

  if (!controller) {
    // TODO: Lester FIXME
    // throw new Error(`Controller not found: ${controller}`);
    console.warn(`Controller not found: ${controller}`);
  }

  return {
    controller: controller ?? null,
    formName,
    authenticatorKey,
    methodType,
  };
};

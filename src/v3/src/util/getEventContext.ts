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
import { IDX_STEP } from '../constants';
import { getAuthenticatorKey } from './getAuthenticatorKey';
import { getAuthenticatorMethod } from './getAuthenticatorMethod';
import { isPasswordRecovery } from './isPasswordRecovery';

export const getFormNameForTransaction = (transaction?: IdxTransaction): string | undefined => {
  if (!transaction) {
    return 'terminal';
  }
  const {
    nextStep: { name: formName } = {},
    neededToProceed,
    context,
    rawIdxState,
  } = transaction;
  const hasSkipRemediationOnly = neededToProceed?.length === 1 && neededToProceed[0].name === 'skip';
  if (!neededToProceed?.length || hasSkipRemediationOnly) {
    // no remediation or only skip remediation with success
    if (context.success) {
      return context.success.name;
    }
    // no remediation or only skip remediation with messages
    if (context.messages) {
      return 'terminal';
    }
    // no remediation or only skip remediation with messages for device enrollment state
    // and the state is meant to be terminal state with different UI than the regular terminal view
    // @ts-ignore OKTA-542514 - deviceEnrollment missing from type
    if (rawIdxState.deviceEnrollment) {
      return IDX_STEP.DEVICE_ENROLLMENT_TERMINAL;
    }
  }
  return formName;
};

export const getEventContext = (transaction?: IdxTransaction): EventContext => {
  if (!transaction) {
    return {
      controller: null,
      formName: 'terminal',
    };
  }

  const { context } = transaction;
  const authenticatorKey = context.currentAuthenticator?.value?.key
    || getAuthenticatorKey(transaction);
  const methodType = getAuthenticatorMethod(transaction);
  const isPasswordRecoveryFlow = isPasswordRecovery(transaction);
  const formName = getFormNameForTransaction(transaction);

  const controller = getV1ClassName(
    formName,
    authenticatorKey,
    methodType,
    isPasswordRecoveryFlow,
  );

  return {
    controller: controller ?? null,
    formName,
    authenticatorKey,
    methodType,
  };
};

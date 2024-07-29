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
import { TransformHookContext } from '../types/hooks';
import { FormBag } from '../types/schema';
import { getAuthenticatorKey } from './getAuthenticatorKey';
import { getAuthenticatorMethod } from './getAuthenticatorMethod';
import { isPasswordRecovery } from './isPasswordRecovery';
import { loc } from './locUtil';

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

export const getTransformHookContext = (
  formBag: FormBag,
  idxTransaction?: IdxTransaction,
): TransformHookContext => {
  const idxContext = idxTransaction?.context;
  const currentAuthenticator = idxContext?.currentAuthenticator?.value;
  // @ts-expect-error Property 'deviceEnrollment' does not exist on type 'IdxContext' ts(2339)
  const deviceEnrollment = idxContext?.deviceEnrollment?.value;
  const currentAuthenticatorEnrollment = idxContext?.currentAuthenticatorEnrollment?.value;
  let formName = getFormNameForTransaction(idxTransaction);
  if (!formBag.uischema.elements.length) {
    // initial loading state
    formName = undefined;
  }
  const isTerminal = formBag.uischema.elements.length === 1
    && formBag.uischema.elements[0].type === 'InfoBox';
  if (isTerminal) {
    formName = 'terminal';
  }
  const userInfo = idxContext?.user?.value;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dataSchema, ...safeFormBag } = formBag;

  return {
    ...getEventContext(idxTransaction),
    formName,
    formBag: safeFormBag,
    userInfo,
    currentAuthenticator: currentAuthenticator ?? currentAuthenticatorEnrollment,
    deviceEnrollment,
    nextStep: idxTransaction?.nextStep,
    idxContext,
    loc,
  };
};

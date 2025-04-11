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

import { IdxRemediation, IdxTransaction, NextStep } from '@okta/okta-auth-js';

import { AUTHENTICATOR_KEY, CONSENT_HEADER_STEPS, IDX_STEP } from '../../constants';
import { AppInfo, IWidgetContext, UserInfo } from '../../types';
import { getAuthenticatorKey } from '../getAuthenticatorKey';
import { getCurrentAuthenticator } from '../getCurrentAuthenticator';

export const areTransactionsEqual = (
  tx1: IdxTransaction | undefined,
  tx2: IdxTransaction | undefined,
): boolean => {
  if (tx1?.nextStep?.name !== tx2?.nextStep?.name) {
    return false;
  }

  const tx1AuthKey = tx1 && getAuthenticatorKey(tx1);
  const tx2AuthKey = tx2 && getAuthenticatorKey(tx2);
  if (tx1AuthKey !== tx2AuthKey) {
    return false;
  }

  const tx1AuthId = typeof tx1 !== 'undefined'
    ? getCurrentAuthenticator(tx1)?.value?.id
    : undefined;
  const tx2AuthId = typeof tx2 !== 'undefined'
    ? getCurrentAuthenticator(tx2)?.value?.id
    : undefined;
  if (tx1AuthId !== tx2AuthId) {
    return false;
  }

  // on the safe mode poll remediation (IDX_STEP.POLL) we _always_
  // want to view the incoming poll transaction as unequal to force
  // the transformer to run again and re-render the view
  if (typeof tx2 !== 'undefined' && tx2.nextStep?.name === IDX_STEP.POLL) {
    return false;
  }

  return true;
};

export const updateTransactionWithNextStep = (
  transaction: IdxTransaction,
  nextStep: NextStep,
  widgetContext: IWidgetContext,
): void => {
  const {
    setIdxTransaction, setIsClientTransaction, setMessage, setStepToRender,
  } = widgetContext;
  const availableSteps = transaction.availableSteps?.filter(
    ({ name }) => name !== nextStep.name,
  ) || [];
  const verifyWithOtherRemediations = transaction.neededToProceed.find(
    ({ name }) => name === nextStep.name,
  ) || {} as IdxRemediation;
  const availableRemediations = transaction.neededToProceed.filter(
    ({ name }) => name !== nextStep.name,
  );

  setMessage(undefined);
  setStepToRender(undefined);
  setIsClientTransaction(false);
  setIdxTransaction({
    ...transaction,
    messages: [],
    neededToProceed: [
      verifyWithOtherRemediations,
      ...availableRemediations,
    ],
    availableSteps: [
      nextStep,
      ...availableSteps,
    ],
    nextStep,
  });
};

export const hasMinAuthenticatorOptions = (
  transaction: IdxTransaction,
  stepName: string,
  min: number,
): boolean => {
  const excludedPages = [
    IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
  ];
  if (excludedPages.includes(transaction.nextStep?.name ?? '')) {
    return false;
  }

  const remediation: IdxRemediation | undefined = transaction.neededToProceed.find(
    ({ name }) => name === stepName,
  );
  if (!remediation) {
    return false;
  }

  const authenticatorInput = remediation.value?.find(({ name }) => name === 'authenticator');
  if (!authenticatorInput) {
    return false;
  }

  // OV options are under methods
  const ovOption = authenticatorInput.options?.find(
    (opt) => opt.relatesTo?.key === AUTHENTICATOR_KEY.OV,
  )?.relatesTo;

  return (
    (authenticatorInput?.options?.length ?? 0) > min
    || (ovOption?.methods?.length ?? 0) > min
  );
};

export const getDisplayName = (transaction: IdxTransaction): string | undefined => {
  const authenticator = getCurrentAuthenticator(transaction);
  return authenticator?.value?.displayName;
};

export const isVerifyFlow = (transaction: IdxTransaction): boolean => {
  // currentAuthenticator is from enrollment flows and currentAuthenticatorEnrollment is from verify flows
  const { context: { currentAuthenticatorEnrollment } } = transaction;
  return typeof currentAuthenticatorEnrollment !== 'undefined';
};

// @ts-expect-error OKTA-627610 captcha missing from context type
export const isCaptchaEnabled = (transaction: IdxTransaction): boolean => typeof transaction.context?.captcha !== 'undefined';

export const isConsentStep = (transaction?: IdxTransaction): boolean => (
  transaction?.nextStep?.name
    ? CONSENT_HEADER_STEPS.includes(transaction.nextStep.name)
    : false
);

export const getUserInfo = (transaction: IdxTransaction): UserInfo => {
  const { context: { user } } = transaction;

  if (!user) {
    return {};
  }
  return user.value as UserInfo;
};

export const getAppInfo = (transaction: IdxTransaction): AppInfo => {
  // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
  const { rawIdxState: { app } } = transaction;

  if (!app) {
    return {};
  }
  return app.value as AppInfo;
};

export const getApplicationName = (transaction?: IdxTransaction): string | null => {
  if (typeof transaction === 'undefined') {
    return null;
  }

  const { label } = getAppInfo(transaction);
  return label ?? null;
};

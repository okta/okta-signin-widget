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

import { IWidgetContext } from '../../types';

import { IDX_STEP } from '../../constants';
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

/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

export const updateTransactionWithNextStep = (
  transaction: IdxTransaction,
  nextStep: NextStep,
  widgetContext: IWidgetContext,
): void => {
  const { setIdxTransaction, setMessage } = widgetContext;
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

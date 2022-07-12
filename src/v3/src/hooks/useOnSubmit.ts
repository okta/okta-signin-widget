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

import { IdxActionParams, NextStep } from '@okta/okta-auth-js';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { useCallback } from 'preact/hooks';

import { useWidgetContext } from '../contexts';
import { getImmutableData, toNestedObject } from '../util';

type OnSubmitHandlerOptions = {
  includeData?: boolean;
  actionFn?: NextStep['action'];
  params?: Record<string, unknown>;
  step?: string;
};

// excluded field from data bag
// TODO: figure out a better approach to guide data submission
const OMITTED_PROPERTIES = ['credentials.confirmPassword'];

export const useOnSubmit = (): (options?: OnSubmitHandlerOptions | undefined) => Promise<void> => {
  const {
    authClient,
    data,
    idxTransaction: prevTransaction,
    setIdxTransaction,
    setStepperStepIndex,
  } = useWidgetContext();

  return useCallback(async (options?: OnSubmitHandlerOptions) => {
    const {
      actionFn, params, includeData, step,
    } = options || {};

    const immutableData = getImmutableData(prevTransaction!, step);

    const fn = actionFn || authClient.idx.proceed;

    let payload: IdxActionParams = {};
    if (includeData) {
      payload = merge(payload, omit(data, OMITTED_PROPERTIES));
    }
    if (params) {
      payload = merge(payload, params);
    }
    if (step) {
      payload = { ...payload, step };
    }
    payload = merge(payload, immutableData);
    payload = toNestedObject(payload);
    if (prevTransaction?.context.stateHandle) {
      payload.stateHandle = prevTransaction.context.stateHandle;
    }
    const transaction = await fn(payload);

    // reset stepper
    if (
      prevTransaction?.nextStep?.name !== transaction.nextStep?.name
      // TODO: revist this to ensure if it is a reliable condition
      || transaction?.requestDidSucceed === true
    ) {
      setStepperStepIndex(0);
    }

    // update transaction state to update the form
    setIdxTransaction(transaction);
  }, [
    data,
    authClient,
    prevTransaction,
    setIdxTransaction,
    setStepperStepIndex,
  ]);
};

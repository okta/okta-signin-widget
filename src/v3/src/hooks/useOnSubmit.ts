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

import { IdxActionParams } from '@okta/okta-auth-js';
import merge from 'lodash/merge';
import { useCallback } from 'preact/hooks';

import { useWidgetContext } from '../contexts';
import { getImmutableData, toNestedObject } from '../util';

type OnSubmitHandlerOptions = {
  includeData?: boolean;
  params?: Record<string, unknown>;
  step: string;
  isActionStep?: boolean;
  stepToRender?: string;
};

export const useOnSubmit = (): (options: OnSubmitHandlerOptions) => Promise<void> => {
  const {
    authClient,
    data,
    idxTransaction: currTransaction,
    setIdxTransaction,
    setStepToRender,
    setAdditionalData,
  } = useWidgetContext();

  return useCallback(async (options: OnSubmitHandlerOptions) => {
    const {
      params,
      includeData,
      step,
      isActionStep,
      stepToRender,
    } = options;

    const immutableData = getImmutableData(currTransaction!, step);

    const fn = authClient.idx.proceed;

    let payload: IdxActionParams = {};
    if (includeData) {
      payload = merge(payload, data);
    }
    if (params) {
      payload = merge(payload, params);
    }
    if (isActionStep) {
      payload = {
        ...payload,
        actions: [{ name: step, params }],
      };
    } else {
      payload = { ...payload, step };
    }
    payload = merge(payload, immutableData);
    payload = toNestedObject(payload);
    if (currTransaction!.context.stateHandle) {
      payload.stateHandle = currTransaction!.context.stateHandle;
    }
    const newTransaction = await fn(payload);
    setIdxTransaction(newTransaction);
    setStepToRender(stepToRender);
    setAdditionalData({});
  }, [
    data,
    authClient,
    currTransaction,
    setIdxTransaction,
    setStepToRender,
    setAdditionalData,
  ]);
};

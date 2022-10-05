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

import { AuthApiError, IdxActionParams, IdxMessage } from '@okta/okta-auth-js';
import { omit } from 'lodash';
import merge from 'lodash/merge';
import { useCallback } from 'preact/hooks';

import { IDX_STEP } from '../constants';
import { useWidgetContext } from '../contexts';
import { MessageType } from '../types';
import {
  areTransactionsEqual,
  getImmutableData,
  loc,
  toNestedObject,
} from '../util';

type OnSubmitHandlerOptions = {
  includeData?: boolean;
  includeImmutableData?: boolean;
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
    dataSchemaRef,
    setAuthApiError,
    setIdxTransaction,
    setIsClientTransaction,
    setMessage,
    setStepToRender,
    setLoading,
    widgetProps: { events },
  } = useWidgetContext();

  return useCallback(async (options: OnSubmitHandlerOptions) => {
    setLoading(true);

    const {
      params,
      includeData,
      includeImmutableData = true,
      step,
      isActionStep,
      stepToRender,
    } = options;

    // TODO: Revisit and refactor this function as it is a dupe of handleError fn in Widget/index.tsx
    const handleError = (error: unknown) => {
      // TODO: handle error based on types
      // AuthApiError is one of the potential error that can be thrown here
      // We will want to expose development stage errors from auth-js and file jiras against it
      setAuthApiError(error as AuthApiError);
      console.error(error);
      // error event
      events?.afterError?.({
        stepName: currTransaction?.nextStep?.name,
      }, error);
      return null;
    };

    const { fieldsToExclude } = dataSchemaRef.current!;

    const immutableData = getImmutableData(currTransaction!, step);

    const fn = authClient.idx.proceed;

    let payload: IdxActionParams = {};
    if (includeData) {
      payload = merge(payload, omit(data, fieldsToExclude(data)));
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
    if (includeImmutableData) {
      payload = merge(payload, immutableData);
    }
    payload = toNestedObject(payload);
    if (currTransaction?.context.stateHandle) {
      payload.stateHandle = currTransaction.context.stateHandle;
    }
    if (step === 'cancel') {
      authClient?.transactionManager.clear({ clearIdxResponse: false });
    }
    setMessage(undefined);
    try {
      const newTransaction = await fn(payload);
      // TODO: OKTA-538791 this is a temp work around until the auth-js fix
      if (!newTransaction.nextStep && newTransaction.availableSteps?.length) {
        newTransaction.nextStep = newTransaction.availableSteps[0];
      }
      setIdxTransaction(newTransaction);
      const transactionHasWarning = (newTransaction.messages || []).some(
        (message) => message.class === MessageType.WARNING.toString(),
      );
      const isClientTransaction = !newTransaction.requestDidSucceed
        || (areTransactionsEqual(currTransaction, newTransaction) && transactionHasWarning);
      setIsClientTransaction(isClientTransaction);
      if (isClientTransaction
          && !newTransaction.messages?.length
          // TODO: OKTA-521014 below logic only needed because of this bug, remove once fixed
          && newTransaction.nextStep?.name
          && ![IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
            IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
          ].includes(newTransaction.nextStep.name)) {
        setMessage({
          message: loc('oform.errorbanner.title', 'login'),
          class: 'ERROR',
          i18n: { key: 'oform.errorbanner.title' },
        } as IdxMessage);
      }
      setStepToRender(stepToRender);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  }, [
    data,
    authClient,
    currTransaction,
    dataSchemaRef,
    events,
    setAuthApiError,
    setIdxTransaction,
    setIsClientTransaction,
    setLoading,
    setMessage,
    setStepToRender,
  ]);
};

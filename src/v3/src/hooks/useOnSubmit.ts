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

import {
  AuthApiError,
  HttpResponse,
  IdxActionParams,
  IdxMessage,
  IdxTransaction,
  RawIdxResponse,
} from '@okta/okta-auth-js';
import { omit } from 'lodash';
import merge from 'lodash/merge';
import { useCallback } from 'preact/hooks';

import { IDX_STEP } from '../constants';
import { useWidgetContext } from '../contexts';
import { ErrorXHR, EventErrorContext, MessageType } from '../types';
import {
  areTransactionsEqual,
  formatError,
  getImmutableData,
  loc,
  toNestedObject,
} from '../util';
import { getEventContext } from '../util/getEventContext';

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

    const getErrorEventContext = (
      resp: RawIdxResponse | HttpResponse['responseJSON'],
    ): EventErrorContext => {
      const error = formatError(resp);
      return {
        xhr: error as unknown as ErrorXHR,
        errorSummary: error.responseJSON && error.responseJSON.errorSummary,
      };
    };

    // TODO: Revisit and refactor this function as it is a dupe of handleError fn in Widget/index.tsx
    const handleError = (transaction: IdxTransaction | undefined, error: unknown) => {
      // TODO: handle error based on types
      // AuthApiError is one of the potential error that can be thrown here
      // We will want to expose development stage errors from auth-js and file jiras against it
      setAuthApiError(error as AuthApiError);
      console.error(error);
      // error event
      events?.afterError?.(
        transaction ? getEventContext(transaction) : {},
        getErrorEventContext(error as AuthApiError),
      );
      return null;
    };

    const { fieldsToExclude, fieldsToTrim } = dataSchemaRef.current!;

    const immutableData = getImmutableData(currTransaction!, step);

    const fn = authClient.idx.proceed;

    let payload: IdxActionParams = {};
    if (includeData) {
      Object.keys(data)
        .filter((key) => fieldsToTrim.includes(key))
        .forEach((key) => {
          if (typeof data[key] === 'string') {
            data[key] = (data[key] as string).trim();
          }
        });
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
        [newTransaction.nextStep] = newTransaction.availableSteps;
      }
      setIdxTransaction(newTransaction);
      const transactionHasWarning = (newTransaction.messages || []).some(
        (message) => message.class === MessageType.WARNING.toString(),
      );
      // TODO: OKTA-521014 below logic only needed because of this bug, remove once fixed
      const isSwitchAuthenticator = newTransaction.nextStep?.name
        && [
          IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
          IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
        ].includes(newTransaction.nextStep.name);
      if (newTransaction.requestDidSucceed === false && !isSwitchAuthenticator) {
        events?.afterError?.(
          getEventContext(newTransaction),
          getErrorEventContext(newTransaction.rawIdxState),
        );
      }
      const isClientTransaction = !newTransaction.requestDidSucceed
        || (areTransactionsEqual(currTransaction, newTransaction) && transactionHasWarning);
      setIsClientTransaction(isClientTransaction);
      if (isClientTransaction
          && !newTransaction.messages?.length
          && !isSwitchAuthenticator) {
        setMessage({
          message: loc('oform.errorbanner.title', 'login'),
          class: 'ERROR',
          i18n: { key: 'oform.errorbanner.title' },
        } as IdxMessage);
      }
      setStepToRender(stepToRender);
    } catch (error) {
      handleError(currTransaction, error);
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

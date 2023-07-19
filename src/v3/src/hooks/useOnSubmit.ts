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
  OAuthError,
  RawIdxResponse,
} from '@okta/okta-auth-js';
import { cloneDeep, merge, omit } from 'lodash';
import { useCallback } from 'preact/hooks';

import { IDX_STEP, ON_PREM_TOKEN_CHANGE_ERROR_KEY } from '../constants';
import { useWidgetContext } from '../contexts';
import { ErrorXHR, EventErrorContext, MessageType } from '../types';
import {
  areTransactionsEqual,
  containsMessageKey,
  formatError,
  getImmutableData,
  isOauth2Enabled,
  loc,
  postRegistrationSubmit,
  preRegistrationSubmit,
  SessionStorage,
  toNestedObject,
  transformIdentifier,
  triggerRegistrationErrorMessages,
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
    setResponseError,
    setIdxTransaction,
    setIsClientTransaction,
    setLoading,
    setMessage,
    setStepToRender,
    widgetProps,
  } = useWidgetContext();
  const { events } = widgetProps;

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
      setResponseError(error as (AuthApiError | OAuthError));
      console.error(error);
      // error event
      events?.afterError?.(
        transaction ? getEventContext(transaction) : {},
        getErrorEventContext(error as (AuthApiError | OAuthError)),
      );
      return null;
    };

    const { fieldsToExclude, fieldsToTrim } = dataSchemaRef.current!;

    const immutableData = getImmutableData(currTransaction!, step);

    let fn = authClient.idx.proceed;

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

    // Allow username transformation if applicable
    if ('identifier' in payload) {
      payload.identifier = transformIdentifier(widgetProps, step, payload.identifier as string);
    }

    // For Granular Consent remediation, scopes within the `optedScopes`
    //  property can include a singular value or n values delimited by a "." eg "some.scope"
    // When they are delimited, properties should not be nested in the final payload
    // - Wrong:   { optedScopes: { some: { scope: true }}}
    // - Correct: { optedScopes: { 'some.scope': true }}
    const keysWithoutNesting = step === IDX_STEP.CONSENT_GRANULAR ? ['optedScopes'] : [];
    payload = toNestedObject(payload, keysWithoutNesting);

    if (step === IDX_STEP.ENROLL_PROFILE) {
      const preRegistrationSubmitPromise = new Promise((resolve) => {
        preRegistrationSubmit(
          widgetProps,
          payload,
          (postData) => {
            payload = { ...payload, ...postData };
            resolve(true);
          },
          (error) => {
            triggerRegistrationErrorMessages(
              error,
              currTransaction!.nextStep!.inputs!,
              setMessage,
            );
            resolve(false);
          },
        );
      });
      if ((await preRegistrationSubmitPromise) === false) {
        const updatedTransaction = cloneDeep(currTransaction);
        setLoading(false);
        setIdxTransaction(updatedTransaction);
        setIsClientTransaction(true);
        // Need to prevent submission from occuring
        return;
      }
    }
    if (currTransaction?.context.stateHandle) {
      payload.stateHandle = currTransaction.context.stateHandle;
    }
    // Required to prevent auth-js from clearing sessionStorage and breaking interaction code flow
    payload.exchangeCodeForTokens = false;
    if (step === 'cancel') {
      authClient?.transactionManager.clear({ clearIdxResponse: false });
      SessionStorage.removeStateHandle();
      if (isOauth2Enabled(widgetProps)) {
        // In this case we need to restart login flow and recreate transaction meta
        fn = authClient.idx.start;
        payload = {};
      }
    }
    // Login flows that mimic step up (moving forward in login pipeline) via internal api calls,
    // need to clear stored stateHandles.
    // This way the flow can maintain the latest state handle. For eg. Device probe calls
    if (step === IDX_STEP.CANCEL_TRANSACTION) {
      SessionStorage.removeStateHandle();
    }
    setMessage(undefined);
    try {
      const newTransaction = await fn(payload);
      // TODO: OKTA-538791 this is a temp work around until the auth-js fix
      if (!newTransaction.nextStep && newTransaction.availableSteps?.length) {
        [newTransaction.nextStep] = newTransaction.availableSteps;
      }
      const transactionHasWarning = (newTransaction.messages || []).some(
        (message) => message.class === MessageType.WARNING.toString(),
      );
      const isClientTransaction = (!newTransaction.requestDidSucceed
          // do not preserve field data on token change errors
          && !containsMessageKey(ON_PREM_TOKEN_CHANGE_ERROR_KEY, newTransaction.messages))
        || (areTransactionsEqual(currTransaction, newTransaction) && transactionHasWarning);

      const onSuccess = (resolve?: (val: unknown) => void) => {
        setIdxTransaction(newTransaction);
        if (newTransaction.requestDidSucceed === false) {
          events?.afterError?.(
            getEventContext(newTransaction),
            getErrorEventContext(newTransaction.rawIdxState),
          );
        }
        setIsClientTransaction(isClientTransaction);
        if (isClientTransaction && !newTransaction.messages?.length) {
          setMessage({
            message: loc('oform.errorbanner.title', 'login'),
            class: 'ERROR',
            i18n: { key: 'oform.errorbanner.title' },
          } as IdxMessage);
        }
        setStepToRender(stepToRender);
        setLoading(false);
        resolve?.(true);
      };

      if (step === IDX_STEP.ENROLL_PROFILE && !isClientTransaction) {
        const postRegistrationSubmitPromise = new Promise((resolve) => {
          postRegistrationSubmit(
            widgetProps,
            // @ts-expect-error Type is object but TS disallows object for Record
            payload.userProfile.email,
            (_response) => { onSuccess(resolve); },
            (error) => {
              triggerRegistrationErrorMessages(
                error,
                currTransaction!.nextStep!.inputs!,
                setMessage,
              );
              resolve(false);
            },
          );
        });
        if ((await postRegistrationSubmitPromise) === false) {
          const updatedTransaction = cloneDeep(currTransaction);
          setIdxTransaction(updatedTransaction);
          setLoading(false);
          setIsClientTransaction(true);
          // Need to prevent remaining logic from executing
          return;
        }
        // No need to continue since onSuccess is called in registration hook callback
        return;
      }
      onSuccess();
    } catch (error) {
      handleError(currTransaction, error);
    } finally {
      setLoading(false);
    }
  }, [
    data,
    authClient,
    currTransaction,
    dataSchemaRef,
    widgetProps,
    events,
    setResponseError,
    setIdxTransaction,
    setIsClientTransaction,
    setLoading,
    setMessage,
    setStepToRender,
  ]);
};

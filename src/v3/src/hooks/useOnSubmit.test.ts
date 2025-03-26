/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
  HttpAPI, IdxAPI, IdxStatus, IdxTransaction, IdxTransactionManagerInterface, OktaAuthIdxOptions,
} from '@okta/okta-auth-js';
import { renderHook } from '@testing-library/preact-hooks';
import { WidgetProps } from 'src/types';
import { getErrorEventContext } from 'src/util';
import { getEventContext } from 'src/util/getEventContext';

import { useWidgetContext } from '../contexts';
import { useOnSubmit } from './useOnSubmit';

const MOCK_STEP = 'mockStep';
const MOCK_NEXT_STEP = 'mockNextStep';
const MOCK_STATE_HANDLE = 'mockStateHandle';
const MOCK_NEW_STATE_HANDLE = 'mockNewStateHandle';
const MOCK_EVENT_CONTEXT = 'mockEventContext';
const MOCK_ERROR_EVENT_CONTEXT = 'mockErrorEventContext';

jest.mock('../contexts', () => ({
  useWidgetContext: jest.fn(),
}));

jest.mock('../util', () => ({
  getImmutableData: jest.fn().mockReturnValue({}),
  getErrorEventContext: jest.fn().mockReturnValue({}),
  toNestedObject: jest.fn().mockReturnValue({}),
  SessionStorage: {
    removeStateHandle: jest.fn(),
  },
  isOauth2Enabled: jest.fn().mockReturnValue(false),
  isConfigRecoverFlow: jest.fn().mockReturnValue(false),
  areTransactionsEqual: jest.fn().mockReturnValue(false),
  containsMessageKey: jest.fn().mockReturnValue(false),
}));

jest.mock('../util/getEventContext', () => ({
  getEventContext: jest.fn().mockReturnValue({}),
}));

type MockOktaAuthIdxInterface = {
  // Only `start` and `proceed` are called in useOnSubmit
  idx: jest.Mocked<Pick<IdxAPI, 'start' | 'proceed'>>;
  // Ony `clear` is called in useOnSubmit
  transactionManager: jest.Mocked<Pick<IdxTransactionManagerInterface, 'clear'>>;
  http: HttpAPI,
  // Ony `recoveryToken` is used in useOnSubmit
  options: Pick<OktaAuthIdxOptions, 'recoveryToken'>;
};

describe('useOnSubmit Hook Tests', () => {
  let mockSetLoading: jest.Mock;
  let mockSetMessage: jest.Mock;
  let mockSetIdxTransaction: jest.Mock;
  let mockSetResponseError: jest.Mock;
  let mockSetIsClientTransaction: jest.Mock;
  let mockSetStepToRender: jest.Mock;
  let mockAuthClient: MockOktaAuthIdxInterface;
  let mockWidgetProps: Partial<WidgetProps>;
  let mockNewTransaction: IdxTransaction;

  beforeEach(() => {
    mockSetLoading = jest.fn();
    mockSetMessage = jest.fn();
    mockSetIdxTransaction = jest.fn();
    mockSetResponseError = jest.fn();
    mockSetIsClientTransaction = jest.fn();
    mockSetStepToRender = jest.fn();

    mockAuthClient = {
      idx: {
        proceed: jest.fn(),
        start: jest.fn(),
      },
      transactionManager: {
        clear: jest.fn(),
      },
      http: {
        setRequestHeader: jest.fn(),
      },
      options: {
        recoveryToken: 'mockRecoveryToken',
      },
    };

    mockWidgetProps = {
      eventEmitter: {
        emit: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        off: jest.fn(),
      },
      features: {
        rememberMe: true,
        deviceFingerprinting: true,
      },
    };

    mockNewTransaction = {
      nextStep: { name: MOCK_NEXT_STEP },
      requestDidSucceed: true,
      status: IdxStatus.SUCCESS,
      proceed: jest.fn(),
      neededToProceed: [],
      rawIdxState: {
        version: '1.0.0',
        stateHandle: MOCK_NEW_STATE_HANDLE,
      },
      actions: {},
      context: {
        stateHandle: MOCK_NEW_STATE_HANDLE,
      },
    };

    (useWidgetContext as jest.Mock).mockReturnValue({
      authClient: mockAuthClient,
      setLoading: mockSetLoading,
      setMessage: mockSetMessage,
      setIdxTransaction: mockSetIdxTransaction,
      setResponseError: mockSetResponseError,
      setIsClientTransaction: mockSetIsClientTransaction,
      setStepToRender: mockSetStepToRender,
      widgetProps: mockWidgetProps,
      data: {},
      idxTransaction: {
        nextStep: {
          name: MOCK_STEP,
        },
        context: {
          stateHandle: MOCK_STATE_HANDLE,
        },
        availableSteps: [{
          name: MOCK_STEP,
        }],
      },
      dataSchemaRef: { current: { fieldsToExclude: jest.fn(), fieldsToTrim: [] } },
    });
  });

  it('should set loading to true at start of hook then set to false on success', async () => {
    mockAuthClient.idx.proceed.mockResolvedValue(mockNewTransaction);

    const { result } = renderHook(() => useOnSubmit());
    const onSubmit = result.current;

    expect(onSubmit).not.toBeUndefined();

    await onSubmit!({ step: MOCK_STEP });

    // setLoading(true) should be called at start of hook
    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true);

    // setLoading(false) should be called at the end of the hook, if successful
    expect(mockSetLoading).toHaveBeenLastCalledWith(false);
  });

  it('should call authClient.idx.proceed with the correct payload', async () => {
    mockAuthClient.idx.proceed.mockResolvedValue(mockNewTransaction);

    const { result } = renderHook(() => useOnSubmit());
    const onSubmit = result.current;

    expect(onSubmit).not.toBeUndefined();

    const payload = { exchangeCodeForTokens: false, stateHandle: MOCK_STATE_HANDLE };
    await onSubmit!({ step: MOCK_STEP });

    expect(mockAuthClient.idx.proceed).toHaveBeenCalledWith(expect.objectContaining(payload));
  });

  it('should call setResponseError and emit afterError event when an error is thrown', async () => {
    (getEventContext as jest.Mock).mockReturnValue(MOCK_EVENT_CONTEXT);
    (getErrorEventContext as jest.Mock).mockReturnValue(MOCK_ERROR_EVENT_CONTEXT);

    const error = new Error('Test error');
    mockAuthClient.idx.proceed.mockRejectedValue(error);

    const { result } = renderHook(() => useOnSubmit());
    const onSubmit = result.current;

    expect(onSubmit).not.toBeUndefined();
    await onSubmit!({ step: MOCK_STEP });

    expect(mockSetResponseError).toHaveBeenCalledWith(error);
    expect(mockWidgetProps.eventEmitter?.emit).toHaveBeenCalledWith(
      'afterError',
      MOCK_EVENT_CONTEXT,
      MOCK_ERROR_EVENT_CONTEXT,
    );
  });

  it('should handle "cancel" step and clear transaction manager', async () => {
    mockAuthClient.idx.proceed.mockResolvedValue(mockNewTransaction);
    const { result } = renderHook(() => useOnSubmit());
    const onSubmit = result.current;

    expect(onSubmit).not.toBeUndefined();
    await onSubmit!({ step: 'cancel' });

    expect(mockAuthClient.transactionManager.clear).toHaveBeenCalledWith({
      clearIdxResponse: false,
    });
  });

  it('should set error messages to undefined before proceeding', async () => {
    mockAuthClient.idx.proceed.mockResolvedValue(mockNewTransaction);

    const { result } = renderHook(() => useOnSubmit());
    const onSubmit = result.current;

    expect(onSubmit).not.toBeUndefined();
    await onSubmit!({ step: MOCK_STEP });

    // Assert that no error message is set and that the only call is setMessage(undefined)
    expect(mockSetMessage.mock.calls.length).toBe(1);
    expect(mockSetMessage.mock.calls[0]).toEqual([undefined]);
  });

  it('should not set error messages when `stepUp` field is present in new transaction for Apple SSOE', async () => {
    // Mock the newTransaction with stepUp set to true
    const mockNewTransactionWithStepUp = {
      ...mockNewTransaction,
      stepUp: true, // Simulate the stepUp field being true
      requestDidSucceed: false, // Ensure requestDidSucceed is false to test the condition
      messages: [],
    };

    mockAuthClient.idx.proceed.mockResolvedValue(mockNewTransactionWithStepUp);

    const { result } = renderHook(() => useOnSubmit());
    const onSubmit = result.current;

    expect(onSubmit).not.toBeUndefined();

    // Call the hook with a step
    await onSubmit!({ step: MOCK_STEP });

    // We should not treat the expected `401` from Apple SSOE `/verify` as a "client transaction" since we want
    // SIW to proceed past failure and not display any error messages
    expect(mockSetIsClientTransaction).toHaveBeenCalledWith(false);
    // Assert that no error message is set and that the only call is setMessage(undefined)
    expect(mockSetMessage.mock.calls.length).toBe(1);
    expect(mockSetMessage.mock.calls[0]).toEqual([undefined]);
  });
});

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

import { IdxTransaction, NextStep, OktaAuth } from '@okta/okta-auth-js';
import { waitFor } from '@testing-library/preact';
import { renderHook } from '@testing-library/preact-hooks';
import { WidgetProps } from 'src/types';

import { usePolling } from './usePolling';

describe('usePolling', () => {
  let mockProps: Partial<WidgetProps>;
  let mockData: Record<string, unknown>;
  let mockProceedFn: jest.Mock;
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    mockProceedFn = jest.fn().mockResolvedValue({
      nextStep: {
        name: 'challenge-poll',
        refresh: 4000,
        action: jest.fn(),
      },
    });
    mockProps = {
      authClient: {
        idx: { proceed: mockProceedFn },
      } as unknown as OktaAuth,
    };
    mockData = {};
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('idxTransaction does not include polling step - returns undefined and no timer', () => {
    it('idxTransaction is undefined', () => {
      const { result } = renderHook(() => usePolling(undefined, mockProps, mockData));
      expect(result.current).toEqual([undefined, undefined]);
      expect(setTimeout).not.toHaveBeenCalled();
    });

    it('idxTransaction exists but does not includes polling step', () => {
      const idxTransaction = {
        nextStep: {
          name: 'fake-step',
        },
      } as IdxTransaction;
      const { result } = renderHook(() => usePolling(idxTransaction, mockProps, mockData));
      expect(result.current).toEqual([undefined, undefined]);
      expect(setTimeout).not.toHaveBeenCalled();
    });
  });

  describe('idxTransaction includes polling step - returns transaction and setup polling timer', () => {
    it('polling step in nextStep', async () => {
      // @ts-ignore remove after adding refresh to nextStep in auth-js
      const idxTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
        },
      } as IdxTransaction;
      renderHook(() => usePolling(idxTransaction, mockProps, mockData));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);

      // expect to call action function when timeout
      jest.advanceTimersByTime(4000);
      expect(mockProceedFn).toHaveBeenCalledWith({
        step: 'challenge-poll',
      });
    });

    it('polling step in availableSteps', () => {
      const mockAction = jest.fn().mockResolvedValue({});
      // @ts-ignore Remove after auth-js OKTA-502378 fix
      const idxTransaction = {
        availableSteps: [{
          name: 'currentAuthenticatorEnrollment-poll',
          refresh: 5000,
          action: mockAction,
        } as NextStep],
      } as IdxTransaction;
      renderHook(() => usePolling(idxTransaction, mockProps, mockData));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should trigger poll request with autoChallenge=false when transaction contains input value', async () => {
      // @ts-ignore remove after adding refresh to nextStep in auth-js
      const idxTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
          inputs: [{ name: 'autoChallenge', value: false }],
        },
      } as IdxTransaction;
      renderHook(() => usePolling(idxTransaction, mockProps, mockData));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);

      // expect to call action function when timeout
      jest.advanceTimersByTime(4000);
      expect(mockProceedFn).toHaveBeenCalledWith({
        stateHandle: undefined,
        autoChallenge: false,
        step: 'challenge-poll',
      });
    });

    it('should trigger poll request with autoChallenge=true when data contains user selected value', async () => {
      // @ts-ignore remove after adding refresh to nextStep in auth-js
      const idxTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
        },
      } as IdxTransaction;
      mockData.autoChallenge = true;
      renderHook(() => usePolling(idxTransaction, mockProps, mockData));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);

      // expect to call action function when timeout
      jest.advanceTimersByTime(4000);
      expect(mockProceedFn).toHaveBeenCalledWith({
        stateHandle: undefined,
        autoChallenge: true,
        step: 'challenge-poll',
      });
    });

    it('should trigger poll request with autoChallenge=true when data contains user selected value and transaction contains different value', async () => {
      // @ts-ignore remove after adding refresh to nextStep in auth-js
      const idxTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
          inputs: [{ name: 'autoChallenge', value: false }],
        },
      } as IdxTransaction;
      mockData.autoChallenge = true;
      renderHook(() => usePolling(idxTransaction, mockProps, mockData));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);

      // expect to call action function when timeout
      jest.advanceTimersByTime(4000);
      expect(mockProceedFn).toHaveBeenCalledWith({
        stateHandle: undefined,
        autoChallenge: true,
        step: 'challenge-poll',
      });
    });

    it('uses default timeout when no refresh is found from transaction', () => {
      const mockAction = jest.fn().mockResolvedValue({});
      const idxTransaction = {
        availableSteps: [{
          name: 'currentAuthenticatorEnrollment-poll',
          action: mockAction,
        } as NextStep],
        rawIdxState: {},
      } as IdxTransaction;
      renderHook(() => usePolling(idxTransaction, mockProps, mockData));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);
    });
  });

  describe('chained polling responses', () => {
    it('should handle multiple polling responses in sequence until reaching stable state', async () => {
      // Setup chained responses: poll -> poll -> stable
      const firstPollResponse = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 2000,
        },
      } as IdxTransaction;

      const secondPollResponse = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 3000,
        },
      } as IdxTransaction;

      const stableResponse = {
        nextStep: {
          name: 'success',
        },
      } as IdxTransaction;

      mockProceedFn
        .mockResolvedValueOnce(firstPollResponse)
        .mockResolvedValueOnce(secondPollResponse)
        .mockResolvedValueOnce(stableResponse);

      const initialTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 4000,
        },
      } as IdxTransaction;

      const { result } = renderHook(() => usePolling(initialTransaction, mockProps, mockData));

      // Initially should return [initialTransaction, undefined] (polling started but no stable state yet)
      expect(result.current).toEqual([initialTransaction, undefined]);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 4000);

      // First poll - should continue polling with new refresh time
      jest.advanceTimersByTime(4000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(1);
      });

      // Wait for effect to run and set up next timer
      await waitFor(() => {
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);
      });

      // Second poll - should continue polling with different refresh time
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(2);
      });

      // Wait for effect to run and set up next timer
      await waitFor(() => {
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
      });

      // Third poll - should reach stable state and stop polling
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(3);
        // Check stableTransaction (second element of tuple)
        expect(result.current[1]).toMatchObject({
          nextStep: {
            name: 'success',
          },
        });
      });
    });

    it('should handle rate limiting during chained polling', async () => {
      const rateLimitResponse = {
        context: {
          errorCode: 'E0000047',
        },
      } as unknown as IdxTransaction;

      const retryResponse = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 2000,
        },
      } as IdxTransaction;

      const stableResponse = {
        nextStep: {
          name: 'success',
        },
      } as IdxTransaction;

      mockProceedFn
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(retryResponse)
        .mockResolvedValueOnce(stableResponse);

      const initialTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 1000,
        },
      } as IdxTransaction;

      const { result } = renderHook(() => usePolling(initialTransaction, mockProps, mockData));

      // First poll should hit rate limit and set 60s timeout
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000);
      });

      // After rate limit timeout, should continue polling
      jest.advanceTimersByTime(60000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);
      });

      // Final poll should reach stable state
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(3);
        // Check stableTransaction (second element of tuple)
        expect(result.current[1]).toMatchObject({
          nextStep: {
            name: 'success',
          },
        });
      });
    });

    it('should handle messages with TOO_MANY_REQUESTS key during chained polling', async () => {
      const rateLimitResponse = {
        messages: [
          { i18n: { key: 'tooManyRequests' } },
        ],
      } as IdxTransaction;

      const stableResponse = {
        nextStep: {
          name: 'success',
        },
      } as IdxTransaction;

      mockProceedFn
        .mockResolvedValueOnce(rateLimitResponse)
        .mockResolvedValueOnce(stableResponse);

      const initialTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 1000,
        },
      } as IdxTransaction;

      renderHook(() => usePolling(initialTransaction, mockProps, mockData));

      // First poll should hit rate limit and set 60s timeout
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(1);
      });

      // Wait for the rate limit handling to set up 60s timer
      await waitFor(() => {
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60000);
      });

      // After rate limit timeout, should reach stable state
      jest.advanceTimersByTime(60000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(2);
      });
    });

    it('should maintain autoChallenge value through chained responses', async () => {
      const firstPollResponse = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 2000,
        },
      } as IdxTransaction;

      const stableResponse = {
        nextStep: {
          name: 'success',
        },
      } as IdxTransaction;

      mockProceedFn
        .mockResolvedValueOnce(firstPollResponse)
        .mockResolvedValueOnce(stableResponse);

      const initialTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 1000,
          inputs: [{ name: 'autoChallenge', value: false }],
        },
      } as unknown as IdxTransaction;

      mockData.autoChallenge = true; // User selected value should override

      renderHook(() => usePolling(initialTransaction, mockProps, mockData));

      // First poll
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenNthCalledWith(1, {
          stateHandle: undefined,
          autoChallenge: true,
          step: 'challenge-poll',
        });
      });

      // Second poll should maintain the same autoChallenge value
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenNthCalledWith(2, {
          stateHandle: undefined,
          autoChallenge: true,
          step: 'challenge-poll',
        });
      });
    });

    it('should handle transition from availableSteps polling to nextStep polling', async () => {
      const transitionResponse = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 3000,
        },
      } as IdxTransaction;

      const stableResponse = {
        nextStep: {
          name: 'success',
        },
      } as IdxTransaction;

      // Mock the proceed function for nextStep polling behavior
      mockProceedFn
        .mockResolvedValueOnce(transitionResponse)
        .mockResolvedValueOnce(stableResponse);

      const initialTransaction = {
        availableSteps: [{
          name: 'currentAuthenticatorEnrollment-poll',
          refresh: 2000,
        } as NextStep],
      } as IdxTransaction;

      const { result } = renderHook(() => usePolling(initialTransaction, mockProps, mockData));

      // First poll from availableSteps using proceed
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(1);
      });

      // Wait for the transition response to set up next timer
      await waitFor(() => {
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 3000);
      });

      // Second poll from nextStep
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(2);
        // Check stableTransaction (second element of tuple)
        expect(result.current[1]).toMatchObject({
          nextStep: {
            name: 'success',
          },
        });
      });
    });

    it('should clear polling when external transaction changes to non-polling step during chain', async () => {
      const firstPollResponse = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 2000,
        },
      } as IdxTransaction;

      mockProceedFn.mockResolvedValueOnce(firstPollResponse);

      const initialTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 1000,
        },
      } as IdxTransaction;

      const { result, rerender } = renderHook(
        (props?: {
          transaction: IdxTransaction
        }) => usePolling(props?.transaction, mockProps, mockData),
        { initialProps: { transaction: initialTransaction } },
      );

      // Start polling
      jest.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(1);
      });

      // External transaction changes to non-polling step
      const nonPollingTransaction = {
        nextStep: {
          name: 'identify',
        },
      } as IdxTransaction;

      rerender({ transaction: nonPollingTransaction });

      // Should immediately stop polling and return [undefined, undefined]
      expect(result.current).toEqual([undefined, undefined]);

      // Should not continue polling even after timeout
      jest.advanceTimersByTime(2000);
      expect(mockProceedFn).toHaveBeenCalledTimes(1); // No additional calls
    });

    it('should restart polling chain when external transaction changes to new polling step', async () => {
      const secondChainResponse = {
        nextStep: {
          name: 'success',
        },
      } as IdxTransaction;

      mockProceedFn.mockResolvedValueOnce(secondChainResponse);

      const initialTransaction = {
        nextStep: {
          name: 'challenge-poll',
          refresh: 1000,
        },
      } as IdxTransaction;

      const { rerender } = renderHook(
        (props?: {
          transaction: IdxTransaction
        }) => usePolling(props?.transaction, mockProps, mockData),
        { initialProps: { transaction: initialTransaction } },
      );

      // Verify initial polling is set up
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);

      // External transaction changes to new polling step - should restart
      const newPollingTransaction = {
        nextStep: {
          name: 'enroll-poll',
          refresh: 500,
        },
      } as IdxTransaction;

      rerender({ transaction: newPollingTransaction });

      // Should restart polling with new transaction parameters
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);

      // Continue new polling chain
      jest.advanceTimersByTime(500);
      await waitFor(() => {
        expect(mockProceedFn).toHaveBeenCalledTimes(1);
        expect(mockProceedFn).toHaveBeenLastCalledWith({
          stateHandle: undefined,
          step: 'enroll-poll',
        });
      });
    });
  });
});

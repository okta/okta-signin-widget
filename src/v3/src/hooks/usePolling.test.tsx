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
      expect(result.current).toBeUndefined();
      expect(setTimeout).not.toHaveBeenCalled();
    });

    it('idxTransaction exists but does not includes polling step', () => {
      const idxTransaction = {
        nextStep: {
          name: 'fake-step',
        },
      } as IdxTransaction;
      const { result } = renderHook(() => usePolling(idxTransaction, mockProps, mockData));
      expect(result.current).toBeUndefined();
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
      const { result } = renderHook(() => usePolling(idxTransaction, mockProps, mockData));

      // expect to setup timer
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);

      // expect to call action function when timeout
      jest.advanceTimersByTime(4000);
      expect(mockProceedFn).toHaveBeenCalled();

      // expect to return new polling transaction
      await waitFor(() => {
        expect(result.current).toMatchObject({
          nextStep: {
            name: 'challenge-poll',
            refresh: 4000,
          },
        });
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
      const { result } = renderHook(() => usePolling(idxTransaction, mockProps, mockData));

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

      // expect to return new polling transaction
      await waitFor(() => {
        expect(result.current).toMatchObject({
          nextStep: {
            name: 'challenge-poll',
            refresh: 4000,
          },
        });
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
      const { result } = renderHook(() => usePolling(idxTransaction, mockProps, mockData));

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

      // expect to return new polling transaction
      await waitFor(() => {
        expect(result.current).toMatchObject({
          nextStep: {
            name: 'challenge-poll',
            refresh: 4000,
          },
        });
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
      const { result } = renderHook(() => usePolling(idxTransaction, mockProps, mockData));

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

      // expect to return new polling transaction
      await waitFor(() => {
        expect(result.current).toMatchObject({
          nextStep: {
            name: 'challenge-poll',
            refresh: 4000,
          },
        });
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
});

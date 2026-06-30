/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable react/prop-types */

import { OktaAuth } from '@okta/okta-auth-js';
import { render, waitFor } from '@testing-library/preact';
import { FunctionComponent, h } from 'preact';
import { useRef } from 'preact/hooks';

// Mock makeRequest so probe resolves via microtasks (no msw, no real timers
// needed). This mock has to be declared before the modules that import it.
jest.mock('../../util', () => ({
  ...jest.requireActual('../../util'),
  makeRequest: jest.fn(),
  isAndroid: () => false,
}));

// eslint-disable-next-line import/first
import { WidgetContextProvider } from '../../contexts';
// eslint-disable-next-line import/first
import { usePolling } from '../../hooks/usePolling';
// eslint-disable-next-line import/first
import { IWidgetContext, LoopbackProbeElement, WidgetProps } from '../../types';
// eslint-disable-next-line import/first
import { makeRequest } from '../../util';
// eslint-disable-next-line import/first
import LoopbackProbe from './LoopbackProbe';

const REFRESH_MS = 200;
const STATE_HANDLE = 'fake-state-handle';
const STEP = 'device-challenge-poll';
const CANCEL_STEP = 'authenticatorChallenge-cancel';

type HarnessProps = {
  widgetProps: WidgetProps;
};

// Mirror Widget/index.tsx: own the shared ref, drive usePolling, render
// LoopbackProbe inside WidgetContextProvider.
const Harness: FunctionComponent<HarnessProps> = ({ widgetProps }) => {
  const pollInFlightRef = useRef<boolean>(false);
  const idxTransaction = {
    nextStep: { name: STEP, refresh: REFRESH_MS },
    context: { stateHandle: STATE_HANDLE },
  } as unknown as Parameters<typeof usePolling>[0];

  usePolling(idxTransaction, widgetProps, {}, pollInFlightRef);

  const ctxValue = {
    authClient: widgetProps.authClient,
    widgetProps,
    idxTransaction,
    setIdxTransaction: jest.fn(),
    setResponseError: jest.fn(),
    setIsClientTransaction: jest.fn(),
    stepToRender: undefined,
    setStepToRender: jest.fn(),
    message: undefined,
    setMessage: jest.fn(),
    data: {},
    setData: jest.fn(),
    dataSchemaRef: { current: undefined },
    loading: false,
    setLoading: jest.fn(),
    setWidgetRendered: jest.fn(),
    setloginHint: jest.fn(),
    languageCode: 'en',
    languageDirection: 'ltr',
    setAbortController: jest.fn(),
    abortController: undefined,
    pollInFlightRef,
  } as unknown as IWidgetContext;

  const uischema: LoopbackProbeElement = {
    type: 'LoopbackProbe',
    options: {
      deviceChallengePayload: {
        ports: ['6512'],
        domain: 'http://localhost',
        challengeRequest: 'mockChallengeRequest',
        probeTimeoutMillis: 100,
      },
      cancelStep: CANCEL_STEP,
      step: STEP,
    },
  } as unknown as LoopbackProbeElement;

  return (
    <WidgetContextProvider value={ctxValue}>
      <LoopbackProbe uischema={uischema} />
    </WidgetContextProvider>
  );
};

describe('disablePollDuringCancel — integration (LoopbackProbe.cancelHandler + usePolling)', () => {
  let proceedMock: jest.Mock;

  beforeEach(() => {
    // never resolves — keeps /cancel in flight forever so the usePolling
    // setTimeout has a chance to fire during the cancel window
    proceedMock = jest.fn().mockImplementation(
      () => new Promise(() => { /* pending */ }),
    );
    // /probe returns non-ok on every port → doLoopback finds no port →
    // cancelHandler fires with reason 'OV_UNREACHABLE_BY_LOOPBACK'
    (makeRequest as jest.Mock).mockImplementation(async () => (
      { ok: false, status: 500 }
    ));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const buildWidgetProps = (
    disableConcurrentPolling: boolean,
    disablePollDuringCancel: boolean,
  ): WidgetProps => ({
    stateToken: 'fake-state-token',
    authClient: { idx: { proceed: proceedMock } } as unknown as OktaAuth,
    features: { disableConcurrentPolling, disablePollDuringCancel },
  } as unknown as WidgetProps);

  it('FF on: cancelHandler claims the flag; usePolling timer is suppressed during /cancel', async () => {
    render(<Harness widgetProps={buildWidgetProps(false, true)} />);

    // 1. probe fails on all ports → cancelHandler fires /cancel
    await waitFor(
      () => expect(proceedMock).toHaveBeenCalledTimes(1),
      { timeout: 1000 },
    );
    expect(proceedMock).toHaveBeenCalledWith(expect.objectContaining({
      actions: [expect.objectContaining({
        name: CANCEL_STEP,
        params: expect.objectContaining({ reason: 'OV_UNREACHABLE_BY_LOOPBACK' }),
      })],
      stateHandle: STATE_HANDLE,
    }));

    // 2. wait long enough for usePolling's setTimeout(REFRESH_MS) to fire 2x
    await new Promise((r) => { setTimeout(r, REFRESH_MS * 3); });

    // 3. guard suppressed the racing /poll → still exactly 1 (the /cancel)
    expect(proceedMock).toHaveBeenCalledTimes(1);
  });

  it('FF off (regression baseline): cancelHandler fires /cancel, usePolling fires racing /poll on same stateHandle', async () => {
    render(<Harness widgetProps={buildWidgetProps(false, false)} />);

    // cancelHandler fires /cancel
    await waitFor(
      () => expect(proceedMock).toHaveBeenCalledTimes(1),
      { timeout: 1000 },
    );

    // usePolling's setTimeout fires /poll — no guard, race window open
    await waitFor(
      () => expect(proceedMock).toHaveBeenCalledTimes(2),
      { timeout: 2000 },
    );

    // 1st call: /cancel
    expect(proceedMock).toHaveBeenNthCalledWith(1, expect.objectContaining({
      actions: [expect.objectContaining({ name: CANCEL_STEP })],
      stateHandle: STATE_HANDLE,
    }));
    // 2nd call: /poll on the same stateHandle as the in-flight /cancel —
    // exactly the cancel-vs-poll race condition this fix targets
    expect(proceedMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
      step: STEP,
      stateHandle: STATE_HANDLE,
    }));
  });

  it('disableConcurrentPolling on but disablePollDuringCancel off: cancel-vs-poll race still open', async () => {
    // Confirms the new FF is the one that closes the cancel-vs-poll race;
    // the existing 7.46.2 FF alone doesn't (cancelHandler doesn't claim).
    render(<Harness widgetProps={buildWidgetProps(true, false)} />);

    await waitFor(
      () => expect(proceedMock).toHaveBeenCalledTimes(1),
      { timeout: 1000 },
    );

    await waitFor(
      () => expect(proceedMock).toHaveBeenCalledTimes(2),
      { timeout: 2000 },
    );

    expect(proceedMock).toHaveBeenNthCalledWith(2, expect.objectContaining({
      step: STEP,
      stateHandle: STATE_HANDLE,
    }));
  });
});

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

import { IdxTransaction, OktaAuth } from '@okta/okta-auth-js';
import { render, waitFor } from '@testing-library/preact';
import { FunctionComponent, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

// Mock makeRequest so probe/challenge resolve via microtasks (no msw, no real
// timers needed). This mock has to be declared before the modules that import it.
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
import { areTransactionsEqual, makeRequest } from '../../util';
// eslint-disable-next-line import/first
import LoopbackProbe from './LoopbackProbe';

const REFRESH_MS = 200;
const STATE_HANDLE = 'fake-state-handle';
const DEVICE_CHALLENGE_POLL = 'device-challenge-poll';
const CHALLENGE_POLL = 'challenge-poll';

const buildTx = (name: string, challengeRequest: string): IdxTransaction => ({
  nextStep: {
    name,
    refresh: REFRESH_MS,
    relatesTo: { value: { challengeRequest } },
  },
  context: { stateHandle: STATE_HANDLE },
  rawIdxState: {},
} as unknown as IdxTransaction);

type ServerState = { step: string, ovAnsweredDeviceChallenge: boolean };

// Steps whose proceed() was rejected as an unknown remediation.
let rejected: string[] = [];

// Models IDX + auth-js for the HAR in OKTA-1258733:
// - once OV answered the device challenge, the next device-challenge-poll
//   response moves the flow to challenge-poll;
// - auth-js rejects proceed() for a remediation that is no longer in the
//   current state, so a stale-step poll fails the same way as in prod. The
//   rejection is recorded and surfaced as a never-settling promise: usePolling
//   rethrows from its setTimeout callback, and an actual rejection there would
//   be an unhandled rejection that fails the jest run. Never settling has the
//   same effect on the chain (no setTransaction, no reschedule). It also keeps
//   pollInFlightRef claimed, so the challenge-poll probe's submit is
//   suppressed too, which matches the prod outcome where that probe never ran.
const buildProceed = (state: ServerState) => jest.fn(async ({ step }: { step?: string }) => {
  if (step && step !== state.step) {
    rejected.push(step);
    return new Promise<IdxTransaction>(() => { /* auth-js: Unknown remediation choice */ });
  }
  if (state.step === DEVICE_CHALLENGE_POLL && state.ovAnsweredDeviceChallenge) {
    // eslint-disable-next-line no-param-reassign
    state.step = CHALLENGE_POLL;
  }
  return buildTx(state.step, `${state.step}-jwt`);
});

type HarnessProps = {
  widgetProps: WidgetProps;
};

// Mirror Widget/index.tsx: own idxTransaction + shared ref, drive usePolling,
// feed its result back through areTransactionsEqual, and render a
// LoopbackProbe for the current step keyed on its challengeRequest the same
// way the transformer rebuilds the element.
const Harness: FunctionComponent<HarnessProps> = ({ widgetProps }) => {
  const pollInFlightRef = useRef<boolean>(false);
  const [idxTransaction, setIdxTransaction] = useState<IdxTransaction | undefined>(
    buildTx(DEVICE_CHALLENGE_POLL, 'dcp-jwt'),
  );
  const pollingTransaction = usePolling(idxTransaction, widgetProps, {}, pollInFlightRef);

  useEffect(() => {
    if (!idxTransaction || !pollingTransaction) {
      return;
    }
    if (!areTransactionsEqual(idxTransaction, pollingTransaction)) {
      setIdxTransaction(pollingTransaction);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingTransaction]);

  const ctxValue = {
    authClient: widgetProps.authClient,
    widgetProps,
    idxTransaction,
    setIdxTransaction,
    setResponseError: jest.fn(),
    setIsClientTransaction: jest.fn(),
    setStepToRender: jest.fn(),
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
    pollInFlightRef,
    chromeLNADenied: false,
    setChromeLNADenied: jest.fn(),
  } as unknown as IWidgetContext;

  const step = idxTransaction?.nextStep?.name as string;
  // @ts-expect-error challengeRequest is not defined on relatesTo value
  const challengeRequest = idxTransaction?.nextStep?.relatesTo?.value?.challengeRequest as string;
  const uischema = {
    type: 'LoopbackProbe',
    options: {
      deviceChallengePayload: {
        ports: ['6512'],
        domain: 'http://localhost',
        challengeRequest,
        probeTimeoutMillis: 100,
      },
      cancelStep: step === DEVICE_CHALLENGE_POLL
        ? 'authenticatorChallenge-cancel' : 'currentAuthenticator-cancel',
      step,
    },
  } as unknown as LoopbackProbeElement;

  return (
    <WidgetContextProvider value={ctxValue}>
      <LoopbackProbe key={challengeRequest} uischema={uischema} />
    </WidgetContextProvider>
  );
};

describe('resetStalePollStep — integration (LoopbackProbe.submitHandler + usePolling)', () => {
  let state: ServerState;
  let proceedMock: ReturnType<typeof buildProceed>;
  let challengeCalls: string[];

  beforeEach(() => {
    state = { step: DEVICE_CHALLENGE_POLL, ovAnsweredDeviceChallenge: false };
    rejected = [];
    proceedMock = buildProceed(state);
    challengeCalls = [];
    (makeRequest as jest.Mock).mockImplementation(async ({ url, data }) => {
      if (url.endsWith('/challenge')) {
        challengeCalls.push(JSON.parse(data).challengeRequest);
        // OV takes longer than one refresh to answer, so usePolling's first
        // device-challenge-poll tick lands before submitHandler (polling log
        // in OKTA-1258733: 1st tick t=5289, probe t=5595, stale tick t=9598).
        await new Promise((r) => { setTimeout(r, REFRESH_MS * 1.5); });
        if (state.step === DEVICE_CHALLENGE_POLL) {
          state.ovAnsweredDeviceChallenge = true;
        }
      }
      return { ok: true, status: 200 };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const buildWidgetProps = (resetStalePollStep: boolean): WidgetProps => ({
    stateToken: 'fake-state-token',
    authClient: { idx: { proceed: proceedMock } } as unknown as OktaAuth,
    features: { disableConcurrentPolling: true, resetStalePollStep },
  } as unknown as WidgetProps);

  const pollSteps = () => proceedMock.mock.calls.map(([{ step }]) => step);

  it('FF off (regression baseline): stale device-challenge-poll tick rejects and polling stops', async () => {
    render(<Harness widgetProps={buildWidgetProps(false)} />);

    // the stale usePolling tick is the one auth-js rejects
    await waitFor(
      () => expect(rejected).toContain(DEVICE_CHALLENGE_POLL),
      { timeout: 3000 },
    );
    const callsAtFailure = proceedMock.mock.calls.length;

    // chain is dead: no more polls even after several refresh windows
    await new Promise((r) => { setTimeout(r, REFRESH_MS * 4); });
    expect(proceedMock).toHaveBeenCalledTimes(callsAtFailure);
  });

  it('FF on: polling continues on challenge-poll and /challenge is sent once per step', async () => {
    render(<Harness widgetProps={buildWidgetProps(true)} />);

    const challengePollCount = () => pollSteps().filter((s) => s === CHALLENGE_POLL).length;
    await waitFor(
      () => expect(challengePollCount()).toBeGreaterThanOrEqual(3),
      { timeout: 3000 },
    );

    // once the step moved to challenge-poll, no stale device-challenge-poll proceed is sent
    expect(rejected).toEqual([]);
    const firstChallengePoll = pollSteps().indexOf(CHALLENGE_POLL);
    expect(pollSteps().slice(firstChallengePoll)).not.toContain(DEVICE_CHALLENGE_POLL);

    // RCA guard (reverted #3916): loopback must not be re-triggered by polling
    expect(challengeCalls).toEqual(['dcp-jwt', 'challenge-poll-jwt']);
  });
});

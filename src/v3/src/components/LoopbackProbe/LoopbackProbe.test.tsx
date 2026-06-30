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

import { render, waitFor } from '@testing-library/preact';
import { rest } from 'msw';
import { SetupServer, setupServer } from 'msw/node';
import { h } from 'preact';
import { LoopbackProbeElement } from 'src/types';

import LoopbackProbe from './LoopbackProbe';

const proceedStub = jest.fn();
let mockWidgetContextOverrides: Record<string, unknown> = {};
jest.mock('../../contexts', () => ({
  useWidgetContext: () => ({
    authClient: {
      idx: {
        proceed: proceedStub,
      },
    },
    idxTransaction: {
      context: {
        stateHandle: 'fake-state-handle',
      },
    },
    setIdxTransaction: jest.fn(),
    ...mockWidgetContextOverrides,
  }),
}));
jest.mock('../../../../util/Logger');

describe('LoopbackProbe', () => {
  const server: SetupServer = setupServer();

  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    mockWidgetContextOverrides = {};
  });
  afterAll(() => {
    server.close();
  });

  it.each`
    step                       | cancelStep                         | hasHttpsDomain
    ${'device-challenge-poll'} | ${'authenticatorChallenge-cancel'} | ${false}
    ${'challenge-poll'}        | ${'currentAuthenticator-cancel'}   | ${false}
    ${'device-challenge-poll'} | ${'authenticatorChallenge-cancel'} | ${true}
    ${'challenge-poll'}        | ${'currentAuthenticator-cancel'}   | ${true}
  `('successfully probes ports and sends challenge', async ({ step, cancelStep, hasHttpsDomain }) => {
    const domain = hasHttpsDomain ? 'https://localhost' : 'http://localhost';
    server.use(
      rest.get(`${domain}:2000/probe`, async (_, res, ctx) => res(ctx.status(500))),
      rest.get(`${domain}:6511/probe`, async (_, res, ctx) => res(ctx.status(500))),
      rest.get(`${domain}:6512/probe`, async (_, res, ctx) => res(ctx.status(200))),
      rest.post(`${domain}:6512/challenge`, async (_, res, ctx) => res(ctx.status(200))),
    );

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep,
          step,
        },
      },
    };

    if (hasHttpsDomain) {
      props.uischema.options.deviceChallengePayload.httpsDomain = 'https://localhost';
    }

    render(<LoopbackProbe {...props} />);

    // 300ms covers 3 probe requests at 100ms max each
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });

    expect(proceedStub).toHaveBeenCalledWith({
      step,
      stateHandle: 'fake-state-handle',
    });
  });

  it.each`
    step                       | cancelStep
    ${'device-challenge-poll'} | ${'authenticatorChallenge-cancel'}
    ${'challenge-poll'}        | ${'currentAuthenticator-cancel'}
  `('successfully probes ports and sends challenge for http domain when https domain exists', async ({ step, cancelStep }) => {
    server.use(
      rest.get('https://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6513/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(200))),
      rest.post('http://localhost:6512/challenge', async (_, res, ctx) => res(ctx.status(200))),
    );

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            httpsDomain: 'https://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep,
          step,
        },
      },
    };

    render(<LoopbackProbe {...props} />);

    // 300ms covers 3 probe requests at 100ms max each
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });

    expect(proceedStub).toHaveBeenCalledWith({
      step,
      stateHandle: 'fake-state-handle',
    });
  });

  it.each`
    step                       | cancelStep                         | hasHttpsDomain
    ${'device-challenge-poll'} | ${'authenticatorChallenge-cancel'} | ${false}
    ${'challenge-poll'}        | ${'currentAuthenticator-cancel'}   | ${false}
    ${'device-challenge-poll'} | ${'authenticatorChallenge-cancel'} | ${true}
    ${'challenge-poll'}        | ${'currentAuthenticator-cancel'}   | ${true}
  `('found no ports', async ({ step, cancelStep, hasHttpsDomain }) => {
    const handers = [
      rest.get(/http:\/\/localhost:\d{4}\/probe/, async (_, res, ctx) => res(ctx.status(500))),
    ];
    if (hasHttpsDomain) {
      handers.push(rest.get(/https:\/\/localhost:\d{4}\/probe/, async (_, res, ctx) => res(ctx.status(500))));
    }
    server.use(...handers);

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep,
          step,
        },
      },
    };

    if (hasHttpsDomain) {
      props.uischema.options.deviceChallengePayload.httpsDomain = 'https://localhost';
    }

    render(<LoopbackProbe {...props} />);

    // 100ms covers 1 probe request at 100ms max
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 100 });

    expect(proceedStub).toHaveBeenCalledWith({
      actions: [{
        name: cancelStep,
        params: {
          reason: 'OV_UNREACHABLE_BY_LOOPBACK',
          statusCode: null,
        },
      }],
      stateHandle: 'fake-state-handle',
    });
  });

  it.each`
    hasHttpsDomain
    ${false}
    ${true}
  `('successfully probes ports but challenge returns non-503 error status', async ({ hasHttpsDomain }) => {
    const domain = hasHttpsDomain ? 'https://localhost' : 'http://localhost';
    server.use(
      rest.get(`${domain}:2000/probe`, async (_, res, ctx) => res(ctx.status(500))),
      rest.get(`${domain}:6511/probe`, async (_, res, ctx) => res(ctx.status(500))),
      rest.get(`${domain}:6512/probe`, async (_, res, ctx) => res(ctx.status(200))),
      rest.post(`${domain}:6512/challenge`, async (_, res, ctx) => res(ctx.status(400))),
    );

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        },
      },
    };

    if (hasHttpsDomain) {
      props.uischema.options.deviceChallengePayload.httpsDomain = 'https://localhost';
    }

    render(<LoopbackProbe {...props} />);

    // 300ms covers 3 probe requests at 100ms max each
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });

    expect(proceedStub).toHaveBeenCalledWith({
      actions: [{
        name: 'authenticatorChallenge-cancel',
        params: {
          reason: 'OV_RETURNED_ERROR',
          statusCode: 400,
        },
      }],
      stateHandle: 'fake-state-handle',
    });
  });

  it('successfully probes ports but challenge returns non-503 error status for http domain when https domain exists', async () => {
    server.use(
      rest.get('https://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6513/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(200))),
      rest.post('http://localhost:6512/challenge', async (_, res, ctx) => res(ctx.status(400))),
    );

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            httpsDomain: 'https://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        },
      },
    };

    render(<LoopbackProbe {...props} />);

    // 300ms covers 3 probe requests at 100ms max each
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });

    expect(proceedStub).toHaveBeenCalledWith({
      actions: [{
        name: 'authenticatorChallenge-cancel',
        params: {
          reason: 'OV_RETURNED_ERROR',
          statusCode: 400,
        },
      }],
      stateHandle: 'fake-state-handle',
    });
  });

  it.each`
    hasHttpsDomain
    ${false}
    ${true}
  `('challenge returns 503 error status but later port succeeds', async ({ hasHttpsDomain }) => {
    const domain = hasHttpsDomain ? 'https://localhost' : 'http://localhost';
    server.use(
      rest.get(`${domain}:2000/probe`, async (_, res, ctx) => res(ctx.status(500))),
      rest.get(`${domain}:6511/probe`, async (_, res, ctx) => res(ctx.status(500))),
      rest.get(`${domain}:6512/probe`, async (_, res, ctx) => res(ctx.status(200))),
      rest.get(`${domain}:6513/probe`, async (_, res, ctx) => res(ctx.status(200))),
      rest.post(`${domain}:6512/challenge`, async (_, res, ctx) => res(ctx.status(503))),
      rest.post(`${domain}:6513/challenge`, async (_, res, ctx) => res(ctx.status(200))),
    );

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        },
      },
    };

    if (hasHttpsDomain) {
      props.uischema.options.deviceChallengePayload.httpsDomain = 'https://localhost';
    }

    render(<LoopbackProbe {...props} />);

    // 400ms covers 4 probe requests at 100ms max each
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 400 });

    expect(proceedStub).toHaveBeenCalledWith({
      step: 'device-challenge-poll',
      stateHandle: 'fake-state-handle',
    });
  });

  it('challenge returns 503 error status but later port succeeds for http domain when https domain exists', async () => {
    server.use(
      rest.get('https://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('https://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(200))),
      rest.get('https://localhost:6513/probe', async (_, res, ctx) => res(ctx.status(200))),
      rest.post('https://localhost:6512/challenge', async (_, res, ctx) => res(ctx.status(503))),
      rest.post('https://localhost:6513/challenge', async (_, res, ctx) => res(ctx.status(503))),
      rest.get('http://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(200))),
      rest.get('http://localhost:6513/probe', async (_, res, ctx) => res(ctx.status(200))),
      rest.post('http://localhost:6512/challenge', async (_, res, ctx) => res(ctx.status(503))),
      rest.post('http://localhost:6513/challenge', async (_, res, ctx) => res(ctx.status(200))),
    );

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            httpsDomain: 'https://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        },
      },
    };

    render(<LoopbackProbe {...props} />);

    // 400ms covers 4 probe requests at 100ms max each
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 400 });

    expect(proceedStub).toHaveBeenCalledWith({
      step: 'device-challenge-poll',
      stateHandle: 'fake-state-handle',
    });
  });

  it.each`
    hasHttpsDomain
    ${false}
    ${true}
  `('port probe request times out', async ({ hasHttpsDomain }) => {
    const handers = [
      rest.get('http://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(
        // This is the right port, but it should fail due to timeout
        // probeTimeoutMillis is set to 100ms
        ctx.delay(200),
        ctx.status(200),
      )),
      rest.get('http://localhost:6513/probe', async (_, res, ctx) => res(ctx.status(500))),
    ];
    if (hasHttpsDomain) {
      handers.push(...[
        rest.get('https://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
        rest.get('https://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
        rest.get('https://localhost:6512/probe', async (_, res, ctx) => res(
          ctx.delay(200),
          ctx.status(200),
        )),
        rest.get('https://localhost:6513/probe', async (_, res, ctx) => res(ctx.status(500))),
      ]);
    }
    server.use(...handers);

    const props: { uischema: LoopbackProbeElement } = {
      uischema: {
        type: 'LoopbackProbe',
        options: {
          deviceChallengePayload: {
            ports: ['2000', '6511', '6512', '6513'],
            domain: 'http://localhost',
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        },
      },
    };

    if (hasHttpsDomain) {
      props.uischema.options.deviceChallengePayload.httpsDomain = 'https://localhost';
    }

    render(<LoopbackProbe {...props} />);

    // each probe timeout is 100ms
    // 250ms covers 3 probe requests resolves asap plus 1 delayed request at 200ms
    // 350ms covers 6 probe requests resolves asap plus 2 delayed requests at 200ms
    const timeout = hasHttpsDomain ? 350 : 250;
    await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout });

    expect(proceedStub).toHaveBeenCalledWith({
      actions: [{
        name: 'authenticatorChallenge-cancel',
        params: {
          reason: 'OV_UNREACHABLE_BY_LOOPBACK',
          statusCode: null,
        },
      }],
      stateHandle: 'fake-state-handle',
    });
  });

  // When features.disableConcurrentPolling is on and a poll-step proceed is
  // already in flight (pollInFlightRef.current === true), submitHandler must
  // suppress its own proceed. cancelHandler is unaffected.
  describe('disableConcurrentPolling guard', () => {
    it('suppresses submitHandler proceed when FF on and a poll is already in flight', async () => {
      const pollInFlightRef = { current: true };
      mockWidgetContextOverrides = {
        widgetProps: { features: { disableConcurrentPolling: true } },
        pollInFlightRef,
      };
      server.use(
        rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(200))),
        rest.post('http://localhost:6512/challenge', async (_, res, ctx) => res(ctx.status(200))),
      );
      const props: { uischema: LoopbackProbeElement } = {
        uischema: {
          type: 'LoopbackProbe',
          options: {
            deviceChallengePayload: {
              ports: ['6512'],
              domain: 'http://localhost',
              challengeRequest: 'mockChallengeRequest',
              probeTimeoutMillis: 100,
            },
            cancelStep: 'authenticatorChallenge-cancel',
            step: 'device-challenge-poll',
          },
        },
      };
      render(<LoopbackProbe {...props} />);

      // wait for probe + challenge to complete; submitHandler would normally
      // call proceed at this point but the FF guard suppresses it
      await new Promise((r) => { setTimeout(r, 250); });
      expect(proceedStub).not.toHaveBeenCalled();
      // ref untouched (we did not toggle it from false→true→false)
      expect(pollInFlightRef.current).toBe(true);
    });

    it('FF off: submitHandler proceed runs even if pollInFlightRef.current is true', async () => {
      const pollInFlightRef = { current: true };
      mockWidgetContextOverrides = {
        widgetProps: { features: { disableConcurrentPolling: false } },
        pollInFlightRef,
      };
      server.use(
        rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(200))),
        rest.post('http://localhost:6512/challenge', async (_, res, ctx) => res(ctx.status(200))),
      );
      const props: { uischema: LoopbackProbeElement } = {
        uischema: {
          type: 'LoopbackProbe',
          options: {
            deviceChallengePayload: {
              ports: ['6512'],
              domain: 'http://localhost',
              challengeRequest: 'mockChallengeRequest',
              probeTimeoutMillis: 100,
            },
            cancelStep: 'authenticatorChallenge-cancel',
            step: 'device-challenge-poll',
          },
        },
      };
      render(<LoopbackProbe {...props} />);

      await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });
      expect(proceedStub).toHaveBeenCalledWith({
        step: 'device-challenge-poll',
        stateHandle: 'fake-state-handle',
      });
    });

    it('FF on: cancelHandler is NOT guarded — user-initiated cancel still goes through', async () => {
      const pollInFlightRef = { current: true };
      mockWidgetContextOverrides = {
        widgetProps: { features: { disableConcurrentPolling: true } },
        pollInFlightRef,
      };
      // probe everywhere fails → cancelHandler fires with OV_UNREACHABLE_BY_LOOPBACK
      server.use(
        rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(500))),
      );
      const props: { uischema: LoopbackProbeElement } = {
        uischema: {
          type: 'LoopbackProbe',
          options: {
            deviceChallengePayload: {
              ports: ['6512'],
              domain: 'http://localhost',
              challengeRequest: 'mockChallengeRequest',
              probeTimeoutMillis: 100,
            },
            cancelStep: 'authenticatorChallenge-cancel',
            step: 'device-challenge-poll',
          },
        },
      };
      render(<LoopbackProbe {...props} />);

      await waitFor(() => expect(proceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });
      expect(proceedStub).toHaveBeenCalledWith(expect.objectContaining({
        actions: [expect.objectContaining({ name: 'authenticatorChallenge-cancel' })],
      }));
    });
  });

  // When features.disablePollDuringCancel is on, LoopbackProbe.cancelHandler
  // participates in the pollInFlightRef protocol as a writer using the
  // "claim only if free, clear only what you claimed" pattern. Polls fired
  // by usePolling during the /cancel proceed are then suppressed at the
  // existing guard in usePolling.ts.
  describe('disablePollDuringCancel guard', () => {
    it('FF on, flag free: cancelHandler claims pollInFlightRef during /cancel proceed', async () => {
      const pollInFlightRef = { current: false };
      // proceedStub returns a pending Promise — cancel stays "in flight" so
      // we can observe the flag while it's claimed
      const cancelPending = new Promise(() => { /* never resolves */ });
      const localProceedStub = jest.fn().mockReturnValue(cancelPending);
      mockWidgetContextOverrides = {
        widgetProps: { features: { disablePollDuringCancel: true } },
        pollInFlightRef,
        authClient: { idx: { proceed: localProceedStub } },
      };
      server.use(
        rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(500))),
      );
      const props: { uischema: LoopbackProbeElement } = {
        uischema: {
          type: 'LoopbackProbe',
          options: {
            deviceChallengePayload: {
              ports: ['6512'],
              domain: 'http://localhost',
              challengeRequest: 'mockChallengeRequest',
              probeTimeoutMillis: 100,
            },
            cancelStep: 'authenticatorChallenge-cancel',
            step: 'device-challenge-poll',
          },
        },
      };
      render(<LoopbackProbe {...props} />);

      await waitFor(() => expect(localProceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });
      // /cancel is on the wire (proceed hasn't resolved) → flag is claimed
      expect(pollInFlightRef.current).toBe(true);
    });

    it('FF on, flag already held: cancelHandler does NOT clobber an in-flight /poll claim', async () => {
      // Race A scenario: a /poll is already in flight (flag truthy) when
      // cancelHandler fires. cancelHandler must not touch the flag — clearing
      // it in our finally would re-enable polling while the original /poll is
      // still on the wire, breaking the 7.46.2 invariant.
      const pollInFlightRef = { current: true };
      let resolveCancel: (value: unknown) => void;
      const cancelPromise = new Promise((resolve) => { resolveCancel = resolve; });
      const localProceedStub = jest.fn().mockReturnValue(cancelPromise);
      mockWidgetContextOverrides = {
        widgetProps: { features: { disablePollDuringCancel: true } },
        pollInFlightRef,
        authClient: { idx: { proceed: localProceedStub } },
      };
      server.use(
        rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(ctx.status(500))),
      );
      const props: { uischema: LoopbackProbeElement } = {
        uischema: {
          type: 'LoopbackProbe',
          options: {
            deviceChallengePayload: {
              ports: ['6512'],
              domain: 'http://localhost',
              challengeRequest: 'mockChallengeRequest',
              probeTimeoutMillis: 100,
            },
            cancelStep: 'authenticatorChallenge-cancel',
            step: 'device-challenge-poll',
          },
        },
      };
      render(<LoopbackProbe {...props} />);

      await waitFor(() => expect(localProceedStub).toHaveBeenCalledTimes(1), { timeout: 300 });
      // Flag still held by the (mocked) in-flight /poll
      expect(pollInFlightRef.current).toBe(true);
      // Resolve /cancel and wait a microtask; cancelHandler's finally runs
      resolveCancel!(undefined);
      await new Promise((r) => { setTimeout(r, 50); });
      // Flag STILL held — cancelHandler did not clear what it did not claim
      expect(pollInFlightRef.current).toBe(true);
    });
  });
});

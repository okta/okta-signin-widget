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
import { setupServer, SetupServerApi } from 'msw/node';
import { h } from 'preact';
import { LoopbackProbeElement } from 'src/types';

import LoopbackProbe from './LoopbackProbe';

const onSubmitHandler = jest.fn();
jest.mock('../../hooks', () => ({
  useOnSubmit: () => onSubmitHandler,
}));
jest.mock('../../../../util/Logger');

describe('LoopbackProbe', () => {
  const server: SetupServerApi = setupServer();

  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  it.each`
    step                       | cancelStep
    ${'device-challenge-poll'} | ${'authenticatorChallenge-cancel'}
    ${'challenge-poll'}        | ${'currentAuthenticator-cancel'}
  `('successfully probes ports and sends challenge', async ({ step, cancelStep }) => {
    server.use(
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
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep,
          step,
        },
      },
    };

    render(<LoopbackProbe {...props} />);

    await waitFor(() => expect(onSubmitHandler).toHaveBeenCalledTimes(1), { timeout: 100 });

    expect(onSubmitHandler).toHaveBeenCalledWith({
      step,
    });
  });

  it.each`
    step                       | cancelStep
    ${'device-challenge-poll'} | ${'authenticatorChallenge-cancel'}
    ${'challenge-poll'}        | ${'currentAuthenticator-cancel'}
  `('found no ports', async ({ step, cancelStep }) => {
    server.use(
      rest.get(/http:\/\/localhost:\d{4}\/probe/, async (_, res, ctx) => res(ctx.status(500))),
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

    render(<LoopbackProbe {...props} />);

    await waitFor(() => expect(onSubmitHandler).toHaveBeenCalledTimes(1), { timeout: 100 });

    expect(onSubmitHandler).toHaveBeenCalledWith({
      isActionStep: true,
      step: cancelStep,
      params: {
        reason: 'OV_UNREACHABLE_BY_LOOPBACK',
        statusCode: null,
      },
    });
  });

  it('successfully probes ports but challenge returns non-503 error status', async () => {
    server.use(
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
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        },
      },
    };

    render(<LoopbackProbe {...props} />);

    await waitFor(() => expect(onSubmitHandler).toHaveBeenCalledTimes(1), { timeout: 100 });

    expect(onSubmitHandler).toHaveBeenCalledWith({
      isActionStep: true,
      step: 'authenticatorChallenge-cancel',
      params: {
        reason: 'OV_RETURNED_ERROR',
        statusCode: 400,
      },
    });
  });

  it('challenge returns 503 error status but later port succeeds', async () => {
    server.use(
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
            challengeRequest: 'mockChallengeRequest',
            probeTimeoutMillis: 100, // optional
          },
          cancelStep: 'authenticatorChallenge-cancel',
          step: 'device-challenge-poll',
        },
      },
    };

    render(<LoopbackProbe {...props} />);

    await waitFor(() => expect(onSubmitHandler).toHaveBeenCalledTimes(1), { timeout: 100 });

    expect(onSubmitHandler).toHaveBeenCalledWith({
      step: 'device-challenge-poll',
    });
  });

  it('port probe request times out', async () => {
    server.use(
      rest.get('http://localhost:2000/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6511/probe', async (_, res, ctx) => res(ctx.status(500))),
      rest.get('http://localhost:6512/probe', async (_, res, ctx) => res(
        // This is the right port, but it should fail due to timeout
        // probeTimeoutMillis is set to 100ms
        ctx.delay(200),
        ctx.status(200),
      )),
      rest.get('http://localhost:6513/probe', async (_, res, ctx) => res(ctx.status(500))),
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

    render(<LoopbackProbe {...props} />);

    await waitFor(() => expect(onSubmitHandler).toHaveBeenCalledTimes(1), {
      timeout: 300, // need to wait longer since we are testing request timeout
    });

    expect(onSubmitHandler).toHaveBeenCalledWith({
      isActionStep: true,
      step: 'authenticatorChallenge-cancel',
      params: {
        reason: 'OV_UNREACHABLE_BY_LOOPBACK',
        statusCode: null,
      },
    });
  });
});

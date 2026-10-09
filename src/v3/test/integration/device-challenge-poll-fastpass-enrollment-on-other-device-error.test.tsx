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

import { HttpRequestClient } from '@okta/okta-auth-js';

import deviceChallengePollResponse from '../../../../playground/mocks/data/idp/idx/device-probing-chrome-dtc.json';
import pollErrorResponse from '../../src/mocks/response/idp/idx/authenticators/poll/device-challenge-poll-fastpass-enrollment-on-other-device-error.json';
import { setup, updateStateHandleInMock } from './util';

describe('device-challenge-poll-fastpass-enrollment-on-other-device-error', () => {
  const errorMessage = pollErrorResponse.messages.value[0].message;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render messages from the failed poll response instead of errorSummary', async () => {
    let pollCount = 0;
    const mockRequestClient: HttpRequestClient = jest.fn().mockImplementation((_, url) => {
      updateStateHandleInMock(deviceChallengePollResponse);

      if (url.endsWith('/interact')) {
        return Promise.resolve({
          responseText: JSON.stringify({
            interaction_handle: 'fake-interactionhandle',
          }),
        });
      }

      if (url.endsWith('/introspect')) {
        return Promise.resolve({
          responseText: JSON.stringify(deviceChallengePollResponse),
        });
      }

      if (url.endsWith('/idp/idx/authenticators/poll')) {
        pollCount += 1;
        // first poll (auto-remediated by auth-js on start) is still pending, the next one fails
        if (pollCount === 1) {
          return Promise.resolve({
            responseText: JSON.stringify(deviceChallengePollResponse),
          });
        }
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          responseText: JSON.stringify(pollErrorResponse),
          status: 400,
          headers: {},
        });
      }
      // reject unknown request
      return Promise.reject(new Error('Unknown request'));
    });
    const {
      container, findByText, queryByText,
    } = await setup({ mockRequestClient });

    expect(await findByText(/Verifying your identity/)).toBeInTheDocument();
    expect(queryByText(errorMessage)).not.toBeInTheDocument();

    jest.advanceTimersByTime(2500 /* refresh: 2000 */);

    const message = await findByText(errorMessage, undefined, { timeout: 5000 });
    expect(pollCount).toBe(2);
    expect(message.closest('[data-se="infobox-error"]')).toBeInTheDocument();
    expect(container).not.toHaveTextContent('Api validation failed');
    expect(await findByText('Back to sign in')).toBeInTheDocument();
  });
});

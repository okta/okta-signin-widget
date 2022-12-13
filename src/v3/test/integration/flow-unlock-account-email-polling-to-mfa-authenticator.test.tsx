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

import { HttpRequestClient } from '@okta/okta-auth-js';
import { waitFor } from '@testing-library/preact';
import emailPollingResponse from '../../src/mocks/response/idp/idx/challenge/unlock-account-email.json';
import webauthnChallengeResponse from '../../src/mocks/response/idp/idx/challenge/unlock-account-sms-verify-webauthn.json';

import { setup, updateStateHandleInMock } from './util';

describe('flow-unlock-account-email-polling-to-mfa-challenge-authenticator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should poll for Magic link email consent and advance to webauthn challenge once consent is provided', async () => {
    let POLL_COUNT = 0;
    const mockRequestClient: HttpRequestClient = jest.fn().mockImplementation((_, url) => {
      updateStateHandleInMock(emailPollingResponse);
      updateStateHandleInMock(webauthnChallengeResponse);

      if (url.endsWith('/interact')) {
        return Promise.resolve({
          responseText: JSON.stringify({
            interaction_handle: 'fake-interactionhandle',
          }),
        });
      }

      if (url.endsWith('/introspect')) {
        return Promise.resolve({
          responseText: JSON.stringify(emailPollingResponse),
        });
      }

      if (url.endsWith('/idp/idx/challenge/poll')) {
        POLL_COUNT += 1;
        let response;
        if (POLL_COUNT >= 2) {
          response = webauthnChallengeResponse;
        } else {
          response = emailPollingResponse;
        }
        return Promise.resolve({
          responseText: JSON.stringify(response),
        });
      }
      // reject unknown request
      return Promise.reject(new Error('Unknown request'));
    });
    const {
      container, findByText, findByTestId,
    } = await setup({ mockRequestClient });

    await findByText(/Verify with your email/);

    /* refresh: 4000 and we poll twice */
    jest.advanceTimersByTime(9000);

    await findByText(
      /Verify with Security Key or Biometric Authenticator/,
      undefined,
      { timeout: 5000 },
    );
    const switchAuthenticatorEle = await findByTestId('switchAuthenticator');
    await waitFor(() => expect(switchAuthenticatorEle).toHaveFocus());

    expect(container).toMatchSnapshot();
  });
});

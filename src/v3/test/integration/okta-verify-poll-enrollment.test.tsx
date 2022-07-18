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
import { setup, updateDynamicAttribute } from './util';
import mockPollResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-okta-verify-mfa.json';
import emailChannelSelectionMockResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-ov-email-channel.json';
import smsChannelSelectionMockResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-ov-sms-channel.json';

describe('okta-verify-poll-enrollment', () => {
  it('should render poll form', async () => {
    const {
      container, findByText, findByAltText,
    } = await setup({ mockResponse: mockPollResponse });

    await findByText(/Set up Okta Verify/);
    await findByText(/On your mobile device/);
    await findByText(/Open the app/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('Okta Verify');
    await findByText(/Can't scan\?/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      container, findByText, findByAltText, user, authClient, findByTestId,
    } = await setup({ mockResponse: mockPollResponse });

    await findByText(/Set up Okta Verify/);
    await findByText(/On your mobile device/);
    await findByText(/Open the app/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('Okta Verify');
    const channelSelectionBtn = await findByText(/Can't scan\?/);

    await user.click(channelSelectionBtn);
    updateDynamicAttribute(container, ['id', 'for']);
    expect(container).toMatchSnapshot();

    await findByText(/More options/);
    await findByText(/Which option do you want to try\?/);
    await findByText(/Email me a setup link/);
    await findByText(/Text me a setup link/);
    const nextBtn = await findByTestId('#/properties/submit');

    await user.click(nextBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/credential/enroll',
      {
        data: JSON.stringify({
          authenticator: {
            channel: 'email',
            id: 'aut2h3fft4y9pDPCS1d7',
          },
          stateHandle: 'fake-stateHandle',
        }),
        headers: {
          Accept: 'application/json; okta-version=1.0.0',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
        },
        withCredentials: true,
      },
    );
  });

  // TODO: re-enable this test once OKTA-514045 is resolved
  it.skip('should send correct payload when toggling between channels', async () => {
    const mockRequestClient: HttpRequestClient = jest.fn().mockImplementation((_, url, options) => {
      if (url.endsWith('/interact')) {
        return Promise.resolve({
          responseText: JSON.stringify({
            interaction_handle: 'fake-interactionhandle',
          }),
        });
      }

      if (url.endsWith('/introspect') || url.endsWith('/poll')) {
        return Promise.resolve({
          responseText: JSON.stringify(mockPollResponse),
        });
      }

      let response;
      const { data } = options;
      const channel = JSON.parse(data).authenticator?.channel;
      if (!channel || channel === 'qrcode') {
        response = mockPollResponse;
      } else if (channel === 'email') {
        response = emailChannelSelectionMockResponse;
      } else {
        response = smsChannelSelectionMockResponse;
      }

      if (response) {
        return Promise.resolve({
          responseText: JSON.stringify(response),
        });
      }

      // reject unknown request
      return Promise.reject(new Error('Unknown request'));
    });
    const {
      findByText, findByAltText, user, authClient, findByTestId, findByLabelText,
    } = await setup({ mockRequestClient });

    await findByText(/Set up Okta Verify/);
    await findByText(/On your mobile device/);
    await findByText(/Open the app/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('Okta Verify');
    const channelSelectionBtn = await findByText(/Can't scan\?/);

    await user.click(channelSelectionBtn);

    await findByText(/More options/);
    await findByText(/Which option do you want to try\?/);
    await findByText(/Email me a setup link/);
    await findByText(/Text me a setup link/);
    const nextBtn = await findByTestId('#/properties/submit');

    await user.click(nextBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/credential/enroll',
      {
        data: JSON.stringify({
          authenticator: {
            channel: 'email',
            id: 'aut2h3fft4y9pDPCS1d7',
          },
          stateHandle: 'fake-stateHandle',
        }),
        headers: {
          Accept: 'application/json; okta-version=1.0.0',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
        },
        withCredentials: true,
      },
    );

    await findByText(/Set up Okta Verify via email link/);
    await user.click(await findByText(/Try a different way/));

    await user.click(await findByLabelText(/Text me a setup link/));
    await user.click(await findByTestId('#/properties/submit'));

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/credential/enroll',
      {
        data: JSON.stringify({
          authenticator: {
            channel: 'sms',
            id: 'aut2h3fft4y9pDPCS1d7',
          },
          stateHandle: '02S5R2phYN7fD7bDkYllPqLFoYW8Jznwula7KSXwe8',
        }),
        headers: {
          Accept: 'application/json; okta-version=1.0.0',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
        },
        withCredentials: true,
      },
    );

    await findByText(/Set up Okta Verify via SMS/);
  });
});

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
import { createAuthJsPayloadArgs, setup, updateStateHandleInMock } from './util';
import qrPollingResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-okta-verify-mfa.json';
import emailPollingResponse from '../../src/mocks/response/idp/idx/challenge/send/enroll-ov-email-mfa.json';
import smsPollingResponse from '../../src/mocks/response/idp/idx/challenge/send/enroll-ov-sms-mfa.json';
import emailChannelSelectionMockResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-ov-email-channel.json';
import smsChannelSelectionMockResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-ov-sms-channel.json';

const createTestContext = async () => {
  const mockRequestClient: HttpRequestClient = jest.fn().mockImplementation((_, url, options) => {
    updateStateHandleInMock(qrPollingResponse);
    updateStateHandleInMock(emailPollingResponse);
    updateStateHandleInMock(smsPollingResponse);
    updateStateHandleInMock(emailChannelSelectionMockResponse);
    updateStateHandleInMock(smsChannelSelectionMockResponse);

    if (url.endsWith('/interact')) {
      return Promise.resolve({
        responseText: JSON.stringify({
          interaction_handle: 'fake-interactionhandle',
        }),
      });
    }

    if (url.endsWith('/introspect') || url.endsWith('/poll')) {
      return Promise.resolve({
        responseText: JSON.stringify(qrPollingResponse),
      });
    }

    if (url.endsWith('/idp/idx/credential/enroll')) {
      let response;
      const { data } = options;
      const channel = JSON.parse(data).authenticator?.channel;
      if (!channel || channel === 'qrcode') {
        response = qrPollingResponse;
      } else if (channel === 'email') {
        response = emailChannelSelectionMockResponse;
      } else {
        response = smsChannelSelectionMockResponse;
      }
      return Promise.resolve({
        responseText: JSON.stringify(response),
      });
    }

    if (url.endsWith('/idp/idx/challenge/send')) {
      const { data } = options;
      const { email } = JSON.parse(data);
      const response = email ? emailPollingResponse : smsPollingResponse;
      return Promise.resolve({
        responseText: JSON.stringify(response),
      });
    }

    // reject unknown request
    return Promise.reject(new Error('Unknown request'));
  });

  return setup({ mockRequestClient, widgetOptions: { features: { autoFocus: true } } });
};

describe('flow-okta-verify-enrollment', () => {
  let mockSystemTime: number;

  beforeEach(() => {
    // Mock system time for triggering resend email reminder element
    mockSystemTime = 1676068045456;
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => mockSystemTime);
    jest.useFakeTimers();
    // sessionStorage 'get' method is mocked for the ReminderPrompts start timestamp variable
    jest.spyOn(global, 'sessionStorage', 'get').mockReturnValue({
      length: 0,
      clear: () => jest.fn(),
      getItem: () => '1676068045456',
      setItem: () => jest.fn(),
      key: () => null,
      removeItem: () => jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('qr polling -> channel selection -> data enrollment (email/default) -> email polling -> try different -> channel selection -> qr polling', async () => {
    const {
      authClient,
      user,
      container,
      findByTestId,
      findByText,
      findByAltText,
    } = await createTestContext();

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
    expect(container).toMatchSnapshot();
    await user.click(await findByText(/Can't scan\?/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    await findByText(/More options/);
    await findByText(/Email me a setup link/);
    await findByText(/Text me a setup link/);
    expect(container).toMatchSnapshot();
    await user.click(await findByText('Next', { selector: 'button' }));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: {
          channel: 'email',
          id: 'aut2h3fft4y9pDPCS1d7',
        },
      }),
    );

    // data enrollment
    await findByText(/Set up Okta Verify via email link/);
    expect(container).toMatchSnapshot();
    const emailEl = await findByTestId('email');
    await user.type(emailEl, 'testuser@okta.com');
    await user.click(await findByText(/Send me the setup link/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/send', {
        email: 'testuser@okta.com',
      }),
    );

    // email polling
    await findByText(/Check your email/);

    // Advance system time to show resend email reminder element
    mockSystemTime += 31_000;
    jest.advanceTimersByTime(500);
    expect(container).toMatchSnapshot();
    await user.click(await findByText(/try a different way/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    await findByText(/More options/);
    await findByText(/Scan a QR code/);
    await findByText(/Text me a setup link/);
    expect(container).toMatchSnapshot();
    await user.click(await findByText(/Next/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: {
          channel: 'qrcode',
          id: 'aut2h3fft4y9pDPCS1d7',
        },
      }),
    );

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
    expect(container).toMatchSnapshot();
  });

  it('qr polling -> channel selection -> data enrollment (sms) -> sms polling -> try different -> channel selection -> qr polling', async () => {
    const {
      authClient,
      user,
      container,
      findByTestId,
      findByText,
      findByAltText,
    } = await createTestContext();

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
    expect(container).toMatchSnapshot();
    await user.click(await findByText(/Can't scan\?/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    await findByText(/More options/);
    await findByText(/Email me a setup link/);
    const smsOption = await findByText(/Text me a setup link/);
    expect(container).toMatchSnapshot();
    await user.click(smsOption);
    await user.click(await findByText('Next', { selector: 'button' }));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: {
          channel: 'sms',
          id: 'aut2h3fft4y9pDPCS1d7',
        },
      }),
    );

    // data enrollment
    await findByText(/Set up Okta Verify via SMS/);
    expect(container).toMatchSnapshot();
    const phoneNumberEl = await findByTestId('phoneNumber');
    const countryEl = await findByTestId('country') as HTMLInputElement;

    await waitFor(() => expect(countryEl).toHaveFocus());
    await user.type(phoneNumberEl, '123456789');
    await user.click(await findByText(/Send me the setup link/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/send', {
        phoneNumber: '+1123456789',
      }),
    );

    // sms polling
    await findByText(/Check your text messages/);
    // Advance system time to show resend email reminder element
    mockSystemTime += 31_000;
    jest.advanceTimersByTime(500);
    expect(container).toMatchSnapshot();
    await user.click(await findByText(/try a different way/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    await findByText(/More options/);
    await findByText(/Scan a QR code/);
    await findByText(/Email me a setup link/);
    expect(container).toMatchSnapshot();
    await user.click(await findByText(/Next/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: {
          channel: 'qrcode',
          id: 'aut2h3fft4y9pDPCS1d7',
        },
      }),
    );

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
  });

  // eslint-disable-next-line jest/expect-expect
  it('qr polling -> channel selection -> qr polling', async () => {
    const { user, findByText, findByAltText } = await createTestContext();

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
    await user.click(await findByText(/Can't scan\?/));

    // channel selection
    await findByText(/More options/);
    await findByText(/Email me a setup link/);
    await findByText(/Text me a setup link/);
    await user.click(await findByText(/try a different way/));

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
  });

  // eslint-disable-next-line jest/expect-expect
  it('qr polling -> channel selection -> data enrollment -> channel selection', async () => {
    const { user, findByText, findByAltText } = await createTestContext();

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
    await user.click(await findByText(/Can't scan\?/));

    // channel selection
    await findByText(/More options/);
    await findByText(/Email me a setup link/);
    await findByText(/Text me a setup link/);
    await user.click(await findByText(/Next/));

    // data enrollment
    await findByText(/Set up Okta Verify via email link/);
    await user.click(await findByText(/try a different way/));

    // channel selection
    await findByText(/More options/);
    await findByText(/Scan a QR code/);
    await findByText(/Text me a setup link/);
    await user.click(await findByText(/Next/));

    // qr polling
    await findByText(/Set up Okta Verify/);
    await findByText(/When prompted, tap Scan a QR code/);
    await findByAltText('QR code');
  });
});
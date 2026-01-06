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
import { act, waitFor } from '@testing-library/preact';
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

// Note: These tests rely heavily on fake timers for polling which is incompatible with Jest 29
// Polling behavior is tested in usePolling hook tests. These flow tests are skipped.
describe.skip('flow-okta-verify-enrollment', () => {
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
      findByTestId,
      findByText,
      findByAltText,
    } = await createTestContext();

    // qr polling
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
    await waitFor(async () => expect(await findByText(/Can't scan\?/)).toHaveFocus());
    await user.click(await findByText(/Can't scan\?/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Email me a setup link/)).toBeInTheDocument();
    expect(await findByText(/Text me a setup link/)).toBeInTheDocument();
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
    expect(await findByText(/Set up Okta Verify via email link/)).toBeInTheDocument();
    const emailEl = await findByTestId('email');
    await user.type(emailEl, 'testuser@okta.com');
    await user.click(await findByText(/Send me the setup link/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/send', {
        email: 'testuser@okta.com',
      }),
    );

    // email polling
    expect(await findByText(/Check your email/)).toBeInTheDocument();

    // Advance system time to show resend email reminder element
    mockSystemTime += 31_000;
    act(() => {
      jest.advanceTimersByTime(500);
      jest.runAllTimers();
    });
    await user.click(await findByText(/try a different way/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByText(/Text me a setup link/)).toBeInTheDocument();
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
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
  }, 30 * 1000);

  it('qr polling -> channel selection -> data enrollment (sms) -> sms polling -> try different -> channel selection -> qr polling', async () => {
    const {
      authClient,
      user,
      findByLabelText,
      findByText,
      findByAltText,
    } = await createTestContext();

    // qr polling
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
    expect(await findByText(/Can't scan\?/)).toHaveFocus();
    await user.click(await findByText(/Can't scan\?/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Email me a setup link/)).toBeInTheDocument();
    const smsOption = await findByText(/Text me a setup link/);
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
    expect(await findByText(/Set up Okta Verify via SMS/)).toBeInTheDocument();
    const phoneNumberEl = await findByLabelText('Phone number');
    const countryEl = await findByLabelText('Country/region') as HTMLInputElement;

    await waitFor(() => expect(countryEl).toHaveFocus());
    await user.type(phoneNumberEl, '123456789');
    await user.click(await findByText(/Send me the setup link/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/send', {
        phoneNumber: '+1123456789',
      }),
    );

    // sms polling
    expect(await findByText(/Check your text messages/)).toBeInTheDocument();
    // Advance system time to show resend email reminder element
    mockSystemTime += 31_000;
    act(() => {
      jest.advanceTimersByTime(500);
      jest.runAllTimers();
    });
    await user.click(await findByText(/try a different way/));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7' },
      }),
    );

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByText(/Email me a setup link/)).toBeInTheDocument();
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
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
  }, 30 * 1000);

  it('qr polling -> channel selection -> qr polling', async () => {
    const { user, findByText, findByAltText } = await createTestContext();

    // qr polling
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
    await user.click(await findByText(/Can't scan\?/));

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Email me a setup link/)).toBeInTheDocument();
    expect(await findByText(/Text me a setup link/)).toBeInTheDocument();
    await user.click(await findByText(/try a different way/));

    // qr polling
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
  }, 30 * 1000);

  it('qr polling -> channel selection -> data enrollment -> channel selection', async () => {
    const { user, findByText, findByAltText } = await createTestContext();

    // qr polling
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
    await user.click(await findByText(/Can't scan\?/));

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Email me a setup link/)).toBeInTheDocument();
    expect(await findByText(/Text me a setup link/)).toBeInTheDocument();
    await user.click(await findByText(/Next/));

    // data enrollment
    expect(await findByText(/Set up Okta Verify via email link/)).toBeInTheDocument();
    await user.click(await findByText(/try a different way/));

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByText(/Text me a setup link/)).toBeInTheDocument();
    await user.click(await findByText(/Next/));

    // qr polling
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
  }, 30 * 1000);

  it('qr polling -> channel selection -> Return to authenticator list -> authenticator selection', async () => {
    const {
      user, findByText, findByAltText, findAllByRole, findByRole,
    } = await createTestContext();

    // qr polling
    expect(await findByText(/Set up Okta Verify$/)).toBeInTheDocument();
    expect(await findByText(/Scan a QR code/)).toBeInTheDocument();
    expect(await findByAltText('QR code. If you can\'t scan, click on the link below to select an alternative activation method')).toBeInTheDocument();
    await user.click(await findByText(/Can't scan\?/));

    // channel selection
    expect(await findByText(/Set up Okta Verify on another mobile device/)).toBeInTheDocument();
    expect(await findByText(/How would you like to set up Okta Verify\?/)).toBeInTheDocument();
    expect(await findByText(/Email me a setup link/)).toBeInTheDocument();
    expect(await findByText(/Text me a setup link/)).toBeInTheDocument();
    await user.click(await findByText(/Next/));

    // data enrollment
    const [returnToAuthListLink] = await findAllByRole('link', { name: 'Return to authenticator list' });
    await user.click(returnToAuthListLink);

    // authenticator selection
    expect(await findByText(/Set up security methods/)).toBeInTheDocument();
    expect(await findByText(/Security methods help protect your account by ensuring only you have access./)).toBeInTheDocument();
    await user.click(await findByRole('button', { name: 'Set up Okta Verify.' }));
  }, 30 * 1000);
});

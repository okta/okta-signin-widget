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

import { createAuthJsPayloadArgs, setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/google-auth-scan-enroll.json';

describe('authenticator-enroll-google-authenticator', () => {
  describe('renders form', () => {
    it('renders QR code view', async () => {
      const { container, findByText } = await setup({ mockResponse });
      await findByText(/Launch Google Authenticator/);
      expect(container).toMatchSnapshot();
    });

    it('renders secret key view', async () => {
      const { container, user, findByText } = await setup({ mockResponse });
      const cantScanBtn = await findByText(/Can't scan?/);
      await user.click(cantScanBtn);
      await findByText(/input the following in the Secret Key Field/);
      expect(container).toMatchSnapshot();

      const nextButton = await findByText(/Next/);
      await user.click(nextButton);
      await findByText(/Enter code displayed from application/);
      expect(container).toMatchSnapshot();
    });

    it('renders challenge view', async () => {
      const { container, user, findByText } = await setup({ mockResponse });
      const nextButton = await findByText(/Next/);
      await user.click(nextButton);
      await findByText(/Enter code displayed from application/);
      expect(container).toMatchSnapshot();
    });
  });

  it('send correct payload', async () => {
    const {
      authClient, user, findByText, findByTestId,
    } = await setup({ mockResponse });
    const nextButton = await findByText(/Next/);
    await user.click(nextButton);
    await findByText(/Enter code displayed from application/);

    const codeEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    await user.type(codeEl, '123456');
    expect(codeEl.value).toEqual('123456');

    const submitButton = await findByText('Verify', { selector: 'button' });
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: '123456' },
      }),
    );
  });

  it('should send correct payload when otp is padded with white spaces', async () => {
    const {
      authClient, user, findByText, findByTestId,
    } = await setup({ mockResponse });
    const nextButton = await findByText(/Next/);
    await user.click(nextButton);
    await findByText(/Enter code displayed from application/);

    const codeEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    const otp = '123456';
    const otpWithSpaces = `${otp}  `;
    await user.type(codeEl, otpWithSpaces);
    expect(codeEl.value).toEqual(otpWithSpaces);

    const submitButton = await findByText('Verify', { selector: 'button' });
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: otp },
      }),
    );
  });

  it('should send correct payload when otp is padded with tab spaces', async () => {
    const {
      authClient, user, findByText, findByTestId,
    } = await setup({ mockResponse });
    const nextButton = await findByText(/Next/);
    await user.click(nextButton);
    await findByText(/Enter code displayed from application/);

    const codeEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    const otp = '123456';
    const otpWithTabSpaces = `\t${otp}\t\t`;
    await user.type(codeEl, otpWithTabSpaces);
    expect(codeEl.value).toEqual(otpWithTabSpaces);

    const submitButton = await findByText('Verify', { selector: 'button' });
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: otp },
      }),
    );
  });

  it('should send correct payload when otp is padded with return characters', async () => {
    const {
      authClient, user, findByText, findByTestId,
    } = await setup({ mockResponse });
    const nextButton = await findByText(/Next/);
    await user.click(nextButton);
    await findByText(/Enter code displayed from application/);

    const codeEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    const otp = '123456';
    const otpWithReturnSpaces = `\r${otp}\r`;
    await user.type(codeEl, otpWithReturnSpaces);
    expect(codeEl.value).toEqual(otp);

    const submitButton = await findByText('Verify', { selector: 'button' });
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: otp },
      }),
    );
  });
});

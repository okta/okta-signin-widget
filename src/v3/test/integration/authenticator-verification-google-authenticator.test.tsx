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
import mockResponse from '../../src/mocks/response/idp/idx/identify/google-auth-verify.json';

describe('authenticator-verification-google-authenticator', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with Google Authenticator/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient,
      user,
      findByText,
      findByTestId,
    } = await setup({ mockResponse });

    await findByText(/Verify with Google Authenticator/);
    await findByText(/Enter the temporary code generated in your Google Authenticator app/);

    const codeEle = await findByTestId('credentials.passcode') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    const verificationCode = '123456';
    await user.type(codeEle, verificationCode);
    expect(codeEle.value).toEqual(verificationCode);
    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: verificationCode },
      }),
    );
  });

  it('should send correct payload when otp is padded with spaces', async () => {
    const {
      authClient,
      user,
      findByText,
      findByTestId,
    } = await setup({ mockResponse });

    await findByText(/Verify with Google Authenticator/);
    await findByText(/Enter the temporary code generated in your Google Authenticator app/);

    const codeEle = await findByTestId('credentials.passcode') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    const otp = '123456';
    const verificationCodeWithSpaces = `  ${otp} `;
    await user.type(codeEle, verificationCodeWithSpaces);
    expect(codeEle.value).toEqual(verificationCodeWithSpaces);
    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: otp },
      }),
    );
  });
});

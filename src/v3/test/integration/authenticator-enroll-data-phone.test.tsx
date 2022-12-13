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

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-phone-voice-sms-mfa.json';

describe('authenticator-enroll-data-phone', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Set up phone authentication/);
    expect(container).toMatchSnapshot();
  });

  it('should display field level error when phone number is not entered', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Set up phone authentication/);
    await findByText(/Enter your phone number to receive a verification code via SMS./);
    const submitButton = await findByText('Receive a code via SMS', { selector: 'button' });

    await user.click(submitButton);
    const phonenumberError = await findByTestId('authenticator.phoneNumber-error');
    expect(phonenumberError.textContent).toEqual('This field cannot be left blank');
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
  });

  it('should send correct payload when selecting sms', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Set up phone authentication/);
    await findByText(/Enter your phone number to receive a verification code via SMS./);

    const submitButton = await findByText('Receive a code via SMS', { selector: 'button' });
    const phoneNumberEle = await findByTestId('authenticator.phoneNumber') as HTMLInputElement;

    const phoneNumber = '2165551234';
    await user.tab();
    await user.type(phoneNumberEle, phoneNumber);

    expect(phoneNumberEle.value).toEqual(phoneNumber);

    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: {
          methodType: 'sms',
          phoneNumber: `+1${phoneNumber}`,
          id: 'aut2h3fft10VeLDPD1d7',
        },
      }),
    );
  });

  it('should send correct payload when selecting voice', async () => {
    const {
      authClient, user, findByTestId, findByText, findByLabelText, container,
    } = await setup({ mockResponse });

    await findByText(/Set up phone authentication/);
    await findByText(/Enter your phone number to receive a verification code via SMS./);

    const methodType = await findByLabelText(/Voice call/);
    await user.click(methodType);

    const submitButton = await findByText('Receive a code via voice call');
    const phoneNumberEle = await findByTestId('authenticator.phoneNumber') as HTMLInputElement;
    const extensionEle = await findByTestId('extension') as HTMLInputElement;

    expect(container).toMatchSnapshot();

    const phoneNumber = '2165551234';
    const extension = '9990';
    await user.type(phoneNumberEle, phoneNumber);
    await user.type(extensionEle, extension);

    expect(phoneNumberEle.value).toEqual(phoneNumber);
    expect(extensionEle.value).toEqual(extension);

    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
        authenticator: {
          methodType: 'voice',
          phoneNumber: `+1${phoneNumber}x${extension}`,
          id: 'aut2h3fft10VeLDPD1d7',
        },
      }),
    );
  });
});

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

import { waitFor } from '@testing-library/preact';

import mockResponse from '../../../../playground/mocks/data/idp/idx/authenticator-verification-tac.json';
import invalidTacMock from '../../../../playground/mocks/data/idp/idx/error-authenticator-verification-tac.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('authenticator-verification-custom-otp', () => {
  it('should render form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 2 });

    expect(heading.textContent).toBe('Verify with Temporary Access Code');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByLabelText, findByRole, findByText,
    } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

    const heading = await findByRole('heading', { level: 2 });

    expect(heading.textContent).toBe('Verify with Temporary Access Code');

    const submitButton = await findByText('Verify', { selector: 'button' });
    const otpCodeEle = await findByLabelText('Enter Code') as HTMLInputElement;
    await waitFor(() => expect(otpCodeEle).toHaveFocus());

    const code = '123456';
    await user.type(otpCodeEle, code);

    expect(otpCodeEle.value).toEqual(code);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: code },
      }),
    );
  });

  it('should show error if wrong passcode provided', async () => {
    const {
      user, findByLabelText, findByRole, findByText,
    } = await setup({
      mockResponses: {
        '/challenge/answer': {
          data: invalidTacMock,
          status: 401,
        },
      },
      widgetOptions: { features: { autoFocus: true } },
    });

    const heading = await findByRole('heading', { level: 2 });

    expect(heading.textContent).toBe('Verify with Temporary Access Code');

    const submitButton = await findByText('Verify', { selector: 'button' });
    const otpCodeEle = await findByLabelText('Enter Code') as HTMLInputElement;
    await waitFor(() => expect(otpCodeEle).toHaveFocus());

    const code = '123456';
    await user.type(otpCodeEle, code);

    expect(otpCodeEle.value).toEqual(code);

    await user.click(submitButton);
    await findByText(/We found some errors./);
    await findByText('Invalid code. Try again.');
  });
});

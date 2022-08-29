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

import { within } from '@testing-library/preact';
import { setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/unlock-account/default.json';

describe('user-unlock-account', () => {
  it('renders form', async () => {
    const { container, findByText, findByLabelText } = await setup({ mockResponse });
    await findByText(/Unlock account\?/);
    await findByLabelText(/Username/);
    expect(container).toMatchSnapshot();
  });

  it('should display client-side validation errors when trying to submit the flow without a username', async () => {
    const {
      authClient, user, findByTestId, findByRole,
    } = await setup({ mockResponse });

    await findByTestId('identifier') as HTMLInputElement;
    const emailAuthenticatorButton = await findByTestId('okta_email');

    await user.click(emailAuthenticatorButton);
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/challenge',
      expect.anything(),
    );
    const alertBox = await findByRole('alert');
    within(alertBox).findByText(/We found some errors/);
    const identifierError = await findByTestId('identifier-error');
    expect(identifierError.textContent).toEqual('This field cannot be left blank');
  });

  describe('send corrent payload', () => {
    it('when select email authenticator', async () => {
      const { authClient, user, findByTestId } = await setup({ mockResponse });

      const usernameEl = await findByTestId('identifier') as HTMLInputElement;
      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');
      const emailAuthenticatorButton = await findByTestId('okta_email');
      await user.click(emailAuthenticatorButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'https://oie-4695462.oktapreview.com/idp/idx/challenge',
        {
          data: JSON.stringify({
            identifier: 'testuser@okta.com',
            authenticator: {
              id: 'aut2h3fft0FbVvFYV1d7',
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

    it('when select phone authenticator', async () => {
      const { authClient, user, findByTestId } = await setup({ mockResponse });

      const usernameEl = await findByTestId('identifier') as HTMLInputElement;
      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');
      const phoneAuthenticatorButton = await findByTestId('phone_number');
      await user.click(phoneAuthenticatorButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'https://oie-4695462.oktapreview.com/idp/idx/challenge',
        {
          data: JSON.stringify({
            identifier: 'testuser@okta.com',
            authenticator: {
              id: 'aut2h3fft10VeLDPD1d7',
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

    it('when click "Back to sign in" button', async () => {
      const { authClient, user, findByTestId } = await setup({ mockResponse });

      const cancelButton = await findByTestId('cancel');
      await user.click(cancelButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'https://oie-4695462.oktapreview.com/idp/idx/cancel',
        {
          data: JSON.stringify({
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
  });
});

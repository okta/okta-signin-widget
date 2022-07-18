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

import { setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';

describe('identify-with-password', () => {
  it('renders form', async () => {
    const { container, findByLabelText } = await setup({ mockResponse });
    await findByLabelText(/Username/);
    expect(container).toMatchSnapshot();
  });

  describe('sends correct payload', () => {
    it('with all required fields', async () => {
      const { authClient, user, findByTestId } = await setup({ mockResponse });

      const usernameEl = await findByTestId('identifier') as HTMLInputElement;
      const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
      const submitButton = await findByTestId('#/properties/submit');

      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');
      await user.type(passwordEl, 'fake-password');
      expect(passwordEl.value).toEqual('fake-password');
      await user.click(submitButton);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'https://oie-8425965.oktapreview.com/idp/idx/identify',
        {
          data: JSON.stringify({
            identifier: 'testuser@okta.com',
            credentials: {
              passcode: 'fake-password',
            },
            rememberMe: false,
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

    it('with required fields + optional fields', async () => {
      const { authClient, user, findByTestId } = await setup({ mockResponse });

      const usernameEl = await findByTestId('identifier') as HTMLInputElement;
      const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
      const rememberMeEl = await findByTestId('rememberMe');
      const submitButton = await findByTestId('#/properties/submit');

      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');
      await user.type(passwordEl, 'fake-password');
      expect(passwordEl.value).toEqual('fake-password');
      await user.click(rememberMeEl);
      await user.click(submitButton);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'https://oie-8425965.oktapreview.com/idp/idx/identify',
        {
          data: JSON.stringify({
            identifier: 'testuser@okta.com',
            credentials: {
              passcode: 'fake-password',
            },
            rememberMe: true,
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

    it('hits httpclient with no inputs', async () => {
      const { authClient, user, findByTestId } = await setup({ mockResponse });

      const submitButton = await findByTestId('#/properties/submit');
      await findByTestId('identifier');
      await findByTestId('credentials.passcode');
      await findByTestId('rememberMe');
      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'https://oie-8425965.oktapreview.com/idp/idx/identify',
        {
          data: JSON.stringify({
            identifier: '',
            credentials: {
              passcode: '',
            },
            rememberMe: false,
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

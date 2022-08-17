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
import { setup } from './util';

import * as cookieUtils from '../../src/util/cookieUtils';
import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';

describe('identify-with-password', () => {
  it('renders the loading state first', async () => {
    const { container, findByLabelText } = await setup({ mockResponse });
    // TODO: OKTA-518793 - replace english string with key once created
    await findByLabelText('Loading...');
    expect(container).toMatchSnapshot();
  });

  it('renders form', async () => {
    const { container, findByLabelText } = await setup({ mockResponse });
    await findByLabelText(/Username/);
    expect(container).toMatchSnapshot();
  });

  it('should pre-populate username into identifier field when set in widget config props', async () => {
    const mockUsername = 'testuser@okta1.com';
    const {
      findByTestId,
    } = await setup({
      mockResponse,
      widgetOptions: { username: mockUsername },
    });

    const usernameEl = await findByTestId('identifier') as HTMLInputElement;

    expect(usernameEl.value).toBe(mockUsername);
  });

  it('should pre-populate username into identifier field when set in cookie', async () => {
    const mockUsername = 'testuser@okta1.com';
    jest.spyOn(cookieUtils, 'getUsernameCookie').mockReturnValue(mockUsername);
    const {
      findByTestId,
    } = await setup({
      mockResponse,
      widgetOptions: { features: { rememberMyUsernameOnOIE: true } },
    });

    const usernameEl = await findByTestId('identifier') as HTMLInputElement;

    expect(usernameEl.value).toBe(mockUsername);
  });

  describe('sends correct payload', () => {
    it('with all required fields', async () => {
      const {
        authClient, user, findByTestId, findByText,
      } = await setup({ mockResponse });

      const usernameEl = await findByTestId('identifier') as HTMLInputElement;
      const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });

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
      const {
        authClient, user, findByTestId, findByText,
      } = await setup({ mockResponse });

      const usernameEl = await findByTestId('identifier') as HTMLInputElement;
      const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
      const rememberMeEl = await findByTestId('rememberMe');
      const submitButton = await findByText('Sign in', { selector: 'button' });

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

    it('fails client side validation with no inputs', async () => {
      const {
        authClient,
        user,
        container,
        findByTestId,
        findByText,
        queryByTestId,
      } = await setup({ mockResponse });
      let identifierError;
      let passwordError;

      const usernameEl = await findByTestId('identifier') as HTMLInputElement;
      const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });

      // empty username & empty password
      await user.click(submitButton);
      await findByText(/We found some errors./);
      identifierError = await findByTestId('identifier-error');
      expect(identifierError.textContent).toEqual('This field cannot be left blank');
      expect(container).toMatchSnapshot();

      passwordError = await findByTestId('credentials.passcode-error');
      expect(passwordError.textContent).toEqual('This field cannot be left blank');
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
        'POST',
        'https://oie-8425965.oktapreview.com/idp/idx/identify',
        expect.anything(),
      );

      // add username - updates field level error
      await user.type(usernameEl, 'testuser@okta.com');
      await user.click(submitButton);
      await waitFor(async () => {
        passwordError = await findByTestId('credentials.passcode-error');
        expect(passwordError.textContent).toEqual('This field cannot be left blank');
        identifierError = queryByTestId('identifier-error');
        expect(identifierError).toBeNull();
        expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
          'POST',
          'https://oie-8425965.oktapreview.com/idp/idx/identify',
          expect.anything(),
        );
      });

      // add password - clears error and send payload
      await user.type(passwordEl, 'fake-password');
      await user.click(submitButton);
      await waitFor(async () => {
        expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
          'POST',
          'https://oie-8425965.oktapreview.com/idp/idx/identify',
          {
            data: JSON.stringify({
              identifier: 'testuser@okta.com',
              credentials: {
                passcode: 'fake-password',
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
        identifierError = queryByTestId('identifier-error');
        expect(identifierError).toBeNull();
        passwordError = queryByTestId('credentials.passcode-error');
        expect(passwordError).toBeNull();
      });
    });
  });
});

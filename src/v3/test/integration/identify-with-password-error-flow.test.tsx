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

import * as cookieUtils from '../../src/util/cookieUtils';
import invalidUsernameMockResponse from '../../src/mocks/response/idp/idx/identify/error-invalid-username.json';
import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';
import wrongPasswordMockresponse from '../../src/mocks/response/idp/idx/identify/error-wrong-password.json';

describe('identify-with-password-error-flow', () => {
  it('should not pre-populate username into identifier field when set in cookie after an error', async () => {
    const mockUsername = 'testuser@okta1.com';
    const badUsername = 'bad_user@bad.com';
    jest.spyOn(cookieUtils, 'getUsernameCookie').mockReturnValue(mockUsername);
    const {
      user,
      findByTestId,
      findByText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: mockResponse,
          status: 200,
        },
        '/idp/idx/identify': {
          data: wrongPasswordMockresponse,
          status: 401,
        },
      },
      widgetOptions: { features: { rememberMyUsernameOnOIE: true } },
    });

    const submitButton = await findByText('Sign in', { selector: 'button' });
    const usernameEl = await findByTestId('identifier') as HTMLInputElement;
    const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;

    await user.clear(usernameEl);
    await user.type(usernameEl, badUsername);
    await user.type(passwordEl, 'wrongPassword1234');
    await user.click(submitButton);

    await findByText('Unable to sign in');
    expect((await findByTestId('identifier') as HTMLInputElement).value).toBe(badUsername);
  });

  it('should display warning message when invalid identifier is entered and should allow user to resubmit same information without showing client-side errors', async () => {
    const {
      authClient,
      user,
      findByTestId,
      findByText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: mockResponse,
          status: 200,
        },
        '/idp/idx/identify': {
          data: invalidUsernameMockResponse,
          status: 200,
        },
      },
    });

    const submitButton = await findByText('Sign in', { selector: 'button' });
    const usernameEl = await findByTestId('identifier') as HTMLInputElement;
    const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;

    const username = 'testeruser@okta1.com';
    const password = 'pass@word123';
    await user.type(usernameEl, username);
    await user.type(passwordEl, password);
    await user.click(submitButton);

    await findByText(/There is no account with the Username/);

    expect((await findByTestId('identifier') as HTMLInputElement).value).toBe(username);
    expect((await findByTestId('credentials.passcode') as HTMLInputElement).value).toBe(password);

    await user.click(await findByText('Sign in', { selector: 'button' }));
    // TODO: OKTA-526754 - Update this assertion once merged back into 0.1
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'http://localhost:3000/idp/idx/identify',
      {
        data: JSON.stringify({
          identifier: username,
          credentials: {
            passcode: password,
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
});

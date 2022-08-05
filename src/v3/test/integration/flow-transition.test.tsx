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

import identifyWithPassword from '../../src/mocks/response/idp/idx/introspect/default.json';
import authenticationVerificationGoogleAuthenticator from '../../src/mocks/response/idp/idx/identify/google-auth-verify.json';

jest.mock('../../src/transformer', () => {
  const actual = jest.requireActual('../../src/transformer');
  return {
    __esModule: true,
    ...actual,
  };
});

const mocked = {
  // eslint-disable-next-line global-require
  transformer: require('../../src/transformer'),
};

describe('Flow transitions', () => {
  it('calls transformIdxTransaction only once when transaction updates', async () => {
    jest.spyOn(mocked.transformer, 'transformIdxTransaction');

    const { findByLabelText } = await setup({ mockResponse: identifyWithPassword });
    await findByLabelText(/Username/);
    expect(mocked.transformer.transformIdxTransaction).toHaveBeenCalledTimes(1);
  });

  it('clears field data when transition from identify-with-password to authentication-verification-ga', async () => {
    const {
      user,
      findByTestId,
      findByText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: identifyWithPassword,
          status: 200,
        },
        '/idx/identify': {
          data: authenticationVerificationGoogleAuthenticator,
          status: 200,
        },
      },
    });

    // form: identify-with-password
    const usernameEl = await findByTestId('identifier') as HTMLInputElement;
    const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    const submitButton = await findByText('Sign in', { selector: 'button' });

    await user.type(usernameEl, 'testuser@okta.com');
    expect(usernameEl.value).toEqual('testuser@okta.com');
    await user.type(passwordEl, 'fake-password');
    expect(passwordEl.value).toEqual('fake-password');
    await user.click(submitButton);

    // form: authentication-verification-ga
    await findByText(/Verify with Google Authenticator/);
    const newFormPasswordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    expect(newFormPasswordEl.value).toEqual('');
  });
});

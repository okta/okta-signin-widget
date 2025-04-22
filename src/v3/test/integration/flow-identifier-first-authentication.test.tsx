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

import { screen, waitFor } from '@testing-library/preact';

import identifyWithThirdPartyIdps from '../../../../playground/mocks/data/idp/idx/identify-with-third-party-idps.json';
import authenticatorPassword from '../../../../playground/mocks/data/idp/idx/authenticator-verification-password.json';
import { setup } from './util';

describe('Flow transition from identifier-first to password challenge', () => {
  it('External IDP buttons do not show spinner when "Next" is clicked for identify form', async () => {
    const { user, pauseMocks, resumeMocks } = await setup({
      mockResponses: {
        '/introspect': {
          data: identifyWithThirdPartyIdps,
          status: 200,
        },
        '/idx/identify': {
          data: authenticatorPassword,
          status: 200,
        },
      },
    });

    let titleElement = await screen.findByText('Sign In');
    await waitFor(() => expect(titleElement).toHaveFocus());

    // form: identifier only
    const identifierEl = await screen.findByLabelText('Username') as HTMLInputElement;
    const nextButton = await screen.findByRole('button', { name: 'Next' });

    await user.type(identifierEl, 'user@example.com');
    expect(identifierEl.value).toEqual('user@example.com');
    expect(nextButton).toBeEnabled();

    pauseMocks();

    await user.click(nextButton);
    const spinners = await screen.findAllByRole('progressbar', { name: 'Processing...' });
    expect(spinners.length).toEqual(1);

    resumeMocks();

    // form: password challenge
    titleElement = await screen.findByText('Verify with your password');
    await waitFor(() => expect(titleElement).toHaveFocus());

    const passwordEl = await screen.findByLabelText('Password', { selector: 'input' }) as HTMLInputElement;
    const verifyButton = await screen.findByRole('button', { name: 'Verify' });
    await user.type(passwordEl, 'fake-password');
    expect(passwordEl.value).toEqual('fake-password');
    expect(verifyButton).toBeEnabled();
  });
});

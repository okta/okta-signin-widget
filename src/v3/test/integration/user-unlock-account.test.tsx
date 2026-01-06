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

import { within, waitFor } from '@testing-library/preact';
import { createAuthJsPayloadArgs, setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/unlock-account/default.json';

describe('user-unlock-account', () => {
  it('renders form', async () => {
    const { container, findByText, findByLabelText } = await setup({ mockResponse });
    await findByText(/Unlock account/);
    await findByLabelText(/Username/);
    expect(container).toMatchSnapshot();
  });

  it('should display client-side validation errors when trying to submit the flow without a username', async () => {
    const {
      user, findAllByRole, findByText, getNewRequestCount,
    } = await setup({ mockResponse });

    const nextButton = await findByText('Next', { selector: 'button' });
    user.click(nextButton);

    expect(getNewRequestCount()).toBe(0);
    const [alertBox] = await findAllByRole('alert');
    expect(await within(alertBox).findByText(/We found some errors/)).toBeInTheDocument();
  });

  describe('send correct payload', () => {
    it('when select email authenticator', async () => {
      const {
        authClient, user, findByTestId, findByText, findByLabelText,
      } = await setup({ mockResponse });
      const titleElement = await findByText(/Unlock account/);
      await waitFor(() => expect(titleElement).toHaveFocus());
      const usernameEl = await findByLabelText('Username') as HTMLInputElement;
      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');

      const nextButton = await findByText('Next', { selector: 'button' });
      user.click(nextButton);

      const emailAuthenticatorButton = await findByTestId('okta_email');
      await user.click(emailAuthenticatorButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
          identifier: 'testuser@okta.com',
          authenticator: {
            id: 'aut2h3fft0FbVvFYV1d7',
          },
        }),
      );
    });

    it('when select phone authenticator', async () => {
      const {
        authClient, user, findByTestId, findByText, findByLabelText,
      } = await setup({ mockResponse });

      const titleElement = await findByText(/Unlock account/);
      await waitFor(() => expect(titleElement).toHaveFocus());
      const usernameEl = await findByLabelText('Username') as HTMLInputElement;
      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');

      const nextButton = await findByText('Next', { selector: 'button' });
      user.click(nextButton);

      const phoneAuthenticatorButton = await findByTestId('phone_number');
      await user.click(phoneAuthenticatorButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
          identifier: 'testuser@okta.com',
          authenticator: {
            id: 'aut2h3fft10VeLDPD1d7',
          },
        }),
      );
    });

    it('when click "Back to sign in" button', async () => {
      const { authClient, user, findByTestId } = await setup({
        mockResponse,
        widgetOptions: {
          authScheme: 'false',
        },
      });

      const cancelButton = await findByTestId('cancel');
      await user.click(cancelButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/cancel'),
      );
    });
  });

  describe('useInteractionCodeFlow', () => {
    it('should restart transaction when clicking "Back to sign in" link', async () => {
      const { authClient, user, findByTestId } = await setup({
        mockResponse,
        widgetOptions: {
          authScheme: 'oauth2',
        },
      });

      const cancelButton = await findByTestId('cancel');
      await user.click(cancelButton);
      expect(authClient.options.httpRequestClient).toHaveBeenNthCalledWith(1,
        'POST', 'http://localhost:3000/oauth2/default/v1/interact', expect.any(Object));
      expect(authClient.options.httpRequestClient).toHaveBeenNthCalledWith(2,
        ...createAuthJsPayloadArgs(
          'POST', 'idp/idx/introspect', {
            interactionHandle: 'fake-interactionhandle',
          },
          'application/ion+json; okta-version=1.0.0',
          'application/ion+json; okta-version=1.0.0',
        ));
    });
  });
});

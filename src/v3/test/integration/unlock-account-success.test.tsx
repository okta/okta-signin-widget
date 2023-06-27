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

import mockResponse from '../../src/mocks/response/idp/idx/challenge/answer/unlock-account-success.json';

describe('unlock-account-success', () => {
  it('renders form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Account successfully unlocked!/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload when clicking "Back to sign in" link', async () => {
    const {
      authClient,
      user,
      findByText,
    } = await setup({
      mockResponse,
      widgetOptions: {
        authScheme: 'false',
      },
    });

    const backToSigninLink = await findByText(/Back to sign in/);

    await user.click(backToSigninLink);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/cancel'),
    );
  });

  describe('useInteractionCodeFlow', () => {
    it('should restart transaction when clicking "Back to sign in" link', async () => {
      const {
        authClient,
        user,
        findByText,
      } = await setup({
        mockResponse,
        widgetOptions: {
          authScheme: 'oauth2',
        },
      });

      const backToSigninLink = await findByText(/Back to sign in/);

      await user.click(backToSigninLink);
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

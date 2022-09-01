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

import mockResponse from '../../src/mocks/response/idp/idx/identify/error-session-expired.json';
import identifyWithPassword from '../../src/mocks/response/idp/idx/introspect/default.json';

describe('error-session-expired', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/You have been logged out due to inactivity. Refresh or return to the sign in screen./);
    expect(container).toMatchSnapshot();
  });

  it('should bootstrap widget when clicking "Back to sign in" link', async () => {
    const {
      user,
      findByText,
      authClient,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: mockResponse,
          status: 200,
        },
        '/idp/idx/introspect': {
          data: identifyWithPassword,
          status: 200,
        },
      },
    });

    const cancelLink = await findByText(/Back to sign in/);
    await user.click(cancelLink);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-123456.oktapreview.com/idp/idx/introspect',
      {
        data: {
          interactionHandle: 'fake-interactionhandle',
        },
        headers: {
          Accept: 'application/ion+json; okta-version=1.0.0',
          'Content-Type': 'application/ion+json; okta-version=1.0.0',
          'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
        },
        withCredentials: true,
      },
    );
  });

  it('should have focus on "Back to sign in" link', async () => {
    const { findByText } = await setup({ mockResponse });
    await findByText(/You have been logged out due to inactivity. Refresh or return to the sign in screen./);
    const cancelLink = await findByText(/Back to sign in/);
    await waitFor(() => expect(cancelLink).toHaveFocus());
  });
});

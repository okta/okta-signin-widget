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

import mockResponse from '../../src/mocks/response/idp/idx/introspect/email-challenge-consent.json';

describe('email-challenge-consent', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Did you just try to sign in\?/);
    await findByText(/CHROME/);
    await findByText(/Okta Dashboard/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload when consent is given', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse });

    const allowConsentBtn = await findByText("Yes, it's me");
    await user.click(allowConsentBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/consent',
      {
        data: JSON.stringify({
          consent: true,
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

  it('should send correct payload when consent is denied', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse });

    const denyConsentBtn = await findByText("No, it's not me");
    await user.click(denyConsentBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/consent',
      {
        data: JSON.stringify({
          consent: false,
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

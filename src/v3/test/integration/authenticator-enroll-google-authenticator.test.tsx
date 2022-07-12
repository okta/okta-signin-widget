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

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/google-auth-scan-enroll.json';

describe('authenticator-enroll-google-authenticator', () => {
  describe('renders form', () => {
    it('renders QR code view', async () => {
      const { container, findByText } = await setup({ mockResponse });
      await findByText(/Launch Google Authenticator/);
      expect(container).toMatchSnapshot();
    });

    it('renders secret key view', async () => {
      const { container, user, findByText } = await setup({ mockResponse });
      const setupDifferentWayButton = await findByText(/Set up a different way/);
      await user.click(setupDifferentWayButton);
      await findByText(/input the following in the Secret Key Field/);
      expect(container).toMatchSnapshot();

      const nextButton = await findByText(/Next/);
      await user.click(nextButton);
      await findByText(/Enter code displayed from application/);
      expect(container).toMatchSnapshot();
    });

    it('renders challenge view', async () => {
      const { container, user, findByText } = await setup({ mockResponse });
      const nextButton = await findByText(/Next/);
      await user.click(nextButton);
      await findByText(/Enter code displayed from application/);
      expect(container).toMatchSnapshot();
    });
  });

  it('send correct payload', async () => {
    const {
      authClient, user, findByText, findByTestId,
    } = await setup({ mockResponse });
    const nextButton = await findByText(/Next/);
    await user.click(nextButton);
    await findByText(/Enter code displayed from application/);

    const codeEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    await user.type(codeEl, '123456');
    expect(codeEl.value).toEqual('123456');

    const submitButton = await findByTestId('#/properties/submit');
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/challenge/answer',
      {
        data: JSON.stringify({
          credentials: {
            passcode: '123456',
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

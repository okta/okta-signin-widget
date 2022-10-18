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

import mockResponse from '../../src/mocks/response/idp/idx/identify/password-reset.json';

describe('authenticator-email-verification-data', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with your email/);
    await findByText(/Send a verification email by clicking on "Send me an email"/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByText,
    } = await setup({ mockResponse });

    await findByText(/Verify with your email/);
    await findByText(/Send a verification email by clicking on "Send me an email"/);

    const submitButton = await findByText('Send me an email', { selector: 'button' });

    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
        authenticator: {
          methodType: 'email',
          id: 'aut41wnl0irhAgO6C5d7',
        },
      }),
    );
  });
});

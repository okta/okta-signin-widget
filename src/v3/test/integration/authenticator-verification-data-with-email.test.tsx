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

import mockResponse from '../../src/mocks/response/idp/idx/identify/authenticator-verification-data-with-email.json';

describe('authenticator-verification-data-with-email', () => {
  it('should render form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('Get a verification email');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const { authClient, user, findByRole } = await setup({ mockResponse });

    const sendBtn = await findByRole('button', { name: 'Send me an email' });
    await user.click(sendBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
        authenticator: { methodType: 'email', id: 'aut41wnl0irhAgO6C5d7' },
      }),
    );
  });
});

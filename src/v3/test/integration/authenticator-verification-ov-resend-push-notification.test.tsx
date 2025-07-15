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

import mockResponse from '../../src/mocks/response/idp/idx/authenticator-verification-ov-resend-push-notification.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('authenticator-verification-ov-resend-push-notification', () => {
  it('renders form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Get a push notification');
    expect(container).toMatchSnapshot();
  });

  it('sends correct payload', async () => {
    const {
      authClient,
      user,
      findByRole,
      findByText,
    } = await setup({ mockResponse });

    const heading = await findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Get a push notification');

    await user.click(await findByText('Resend push notification', { selector: 'button' }));

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
        authenticator: { id: 'aut2h3fft4y9pDPCS1d7', methodType: 'push' },
      }),
    );
  });
});

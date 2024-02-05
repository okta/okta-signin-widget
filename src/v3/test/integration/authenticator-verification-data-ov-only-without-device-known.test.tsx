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

import mockResponse from '../../../../playground/mocks/data/idp/idx/authenticator-verification-data-ov-only-without-device-known.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('authenticator-verification-data-ov-only-without-device-known', () => {
  it('should render form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Verify it\'s you with a security method');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload when clicking "Get a push notification"', async () => {
    const {
      authClient, user, findByRole,
    } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

    const heading = await findByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Verify it\'s you with a security method');

    const authenticatorButton = await findByRole('button', { name: 'Get a push notification' });
    await user.click(authenticatorButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
        authenticator: { id: 'aut13qrZReYpIib7R0g4', methodType: 'push' },
      }, 'application/ion+json; okta-version=1.0.0'),
    );
  });
});

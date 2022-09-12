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

import mockResponse from '../../src/mocks/response/idp/idx/introspect/all-enabled-features.json';

describe('Send correct payload when trigger flow entry button', () => {
  it('when click "Forgot Password" button', async () => {
    const { authClient, user, findByTestId } = await setup({ mockResponse });

    const forgotPasswordButton = await findByTestId('forgot-password');
    await user.click(forgotPasswordButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/recover'),
    );
  });

  it('when click "Register" button', async () => {
    const { authClient, user, findByTestId } = await setup({ mockResponse });

    const forgotPasswordButton = await findByTestId('enroll');
    await user.click(forgotPasswordButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/enroll'),
    );
  });

  it('when click "Unlock account" button', async () => {
    const { authClient, user, findByTestId } = await setup({ mockResponse });

    const forgotPasswordButton = await findByTestId('unlock');
    await user.click(forgotPasswordButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/unlock-account'),
    );
  });
});

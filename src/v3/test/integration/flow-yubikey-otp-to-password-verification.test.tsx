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

import identifyWithPassword from '../../../../playground/mocks/data/idp/idx/authenticator-verification-password.json';
import yubikeyVerificationResponse from '../../../../playground/mocks/data/idp/idx/authenticator-verification-yubikey.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('Flow transition from YubiKey verification to Password MFA', () => {
  it('clears field data when transition from yubikey verification to password MFA', async () => {
    const {
      authClient,
      user,
      findByTestId,
      findByText,
    } = await setup({
      widgetOptions: { features: { autoFocus: true } },
      mockResponses: {
        '/introspect': {
          data: yubikeyVerificationResponse,
          status: 200,
        },
        '/idx/challenge/answer': {
          data: identifyWithPassword,
          status: 200,
        },
      },
    });

    await waitFor(async () => expect(await findByTestId('credentials.passcode')).toHaveFocus());
    // form: Yubikey code entry
    const yubikeyCodeEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    await user.type(yubikeyCodeEl, '1234abcd8520');
    expect(yubikeyCodeEl.value).toEqual('1234abcd8520');

    await user.click(await findByText('Verify', { selector: 'button' }));
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', { credentials: { passcode: '1234abcd8520' } }),
    );

    // form: verify with password MFA
    await findByText(/Verify with your password/);
    const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    expect(passwordEl.value).toEqual('');
  });
});

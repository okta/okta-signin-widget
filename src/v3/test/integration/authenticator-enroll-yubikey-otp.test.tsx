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

import mockResponse from '../../../../playground/mocks/data/idp/idx/authenticator-enroll-yubikey.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('authenticator-enroll-yubikey-otp', () => {
  it('renders form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Set up YubiKey/);
    expect(container).toMatchSnapshot();
  });

  it('fails client validation when missing verification code', async () => {
    const {
      user,
      findByTestId,
      findByText,
      findAllByRole,
    } = await setup({ mockResponse });

    await user.click(await findByText('Set up', { selector: 'button' }));
    const [globalError] = await findAllByRole('alert');
    expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
    const identifierError = await findByTestId('credentials.passcode-error');
    expect(identifierError.textContent).toEqual('This field cannot be left blank');
  });

  it('sends correct payload', async () => {
    const {
      authClient,
      user,
      findByTestId,
      findByText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Set up YubiKey/);
    await waitFor(() => expect(titleElement).toHaveFocus());
    const yubikeyCodeEl = await findByTestId('credentials.passcode');
    await user.type(yubikeyCodeEl, '1234');
    await user.click(await findByText('Set up', { selector: 'button' }));

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', { credentials: { passcode: '1234' } }),
    );
  });
});

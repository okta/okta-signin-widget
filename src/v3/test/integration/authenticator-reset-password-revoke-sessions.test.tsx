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
import { createAuthJsPayloadArgs, setup } from './util';
import mockResponse from '../../src/mocks/response/idp/idx/authenticator-password-reset-revoke-sessions.json';

describe('authenticator-reset-password-revoke-sessions', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Reset your password/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload with checked "Sign me out of all other devices" box', async () => {
    const {
      authClient, user, findByText, findByLabelText, findByRole,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Reset your password/);
    await waitFor(() => expect(titleElement).toHaveFocus());
    await findByText(/Password requirements/);

    const submitButton = await findByRole('button', { name: 'Reset Password' });
    const newPasswordEle = await findByLabelText('New password') as HTMLInputElement;
    const confirmPasswordEle = await findByLabelText(/Re-enter password/) as HTMLInputElement;
    const revokeSessionsCheckbox = await findByLabelText(/Sign me out of all other devices/);

    const password = 'superSecretP@ssword12';
    await user.type(newPasswordEle, password);
    await user.type(confirmPasswordEle, password);

    expect(newPasswordEle.value).toEqual(password);
    expect(confirmPasswordEle.value).toEqual(password);

    await user.click(revokeSessionsCheckbox);
    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: password, revokeSessions: true },
      }),
    );
  });

  it('should send correct payload with unchecked "Sign me out of all other devices" box', async () => {
    const {
      authClient, user, findByLabelText, findByText, findByRole,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Reset your password/);
    await waitFor(() => expect(titleElement).toHaveFocus());
    await findByText(/Password requirements/);

    const submitButton = await await findByRole('button', { name: 'Reset Password' });
    const newPasswordEle = await findByLabelText('New password') as HTMLInputElement;
    const confirmPasswordEle = await findByLabelText(/Re-enter password/) as HTMLInputElement;

    const password = 'superSecretP@ssword12';
    await user.type(newPasswordEle, password);
    await user.type(confirmPasswordEle, password);

    expect(newPasswordEle.value).toEqual(password);
    expect(confirmPasswordEle.value).toEqual(password);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: password, revokeSessions: false },
      }),
    );
  });
});

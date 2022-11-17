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

import { within } from '@testing-library/preact';
import { createAuthJsPayloadArgs, setup, updateDynamicAttribute } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/identify/authenticator-expired-password.json';

describe('authenticator-expired-password', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Your password has expired/);
    updateDynamicAttribute(container, ['aria-labelledby', 'id']);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload with matching fields', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Your password has expired/);
    await findByText(/Password requirements/);

    const submitButton = await findByText('Change Password', { selector: 'button' });
    const newPasswordEle = await findByTestId('credentials.passcode') as HTMLInputElement;
    const confirmPasswordEle = await findByTestId('confirmPassword') as HTMLInputElement;

    const password = 'superSecretP@ssword12';
    await user.type(newPasswordEle, password);
    await user.type(confirmPasswordEle, password);

    expect(newPasswordEle.value).toEqual(password);
    expect(confirmPasswordEle.value).toEqual(password);

    const passwordMatchesWrapper = await findByTestId('password-authenticator--matches') as HTMLDivElement;
    await within(passwordMatchesWrapper).findByRole('img', { name: 'complete' });

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: password },
      }),
    );
  });

  it('should not make network request when only new password has a value', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Your password has expired/);
    await findByText(/Password requirements/);

    const submitButton = await findByText('Change Password', { selector: 'button' });
    const newPasswordEle = await findByTestId('credentials.passcode') as HTMLInputElement;

    await user.type(newPasswordEle, 'superSecretP@ssword12');

    const passwordMatchesWrapper = await findByTestId('password-authenticator--matches') as HTMLDivElement;
    await within(passwordMatchesWrapper).findByRole('img', { name: 'incomplete' });

    await user.click(submitButton);

    const confirmPasswordError = await findByTestId('confirmPassword-error');

    expect(confirmPasswordError.innerHTML).toBe('This field cannot be left blank');
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
  });

  it('should not make network request when only confirm password has a value', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Your password has expired/);
    await findByText(/Password requirements/);

    const submitButton = await findByText('Change Password', { selector: 'button' });
    const confirmPasswordEle = await findByTestId('confirmPassword') as HTMLInputElement;

    // the new password field is auto focused, so it will trigger the error once we nav away
    await user.tab();
    const val = 'abc123';
    await user.type(confirmPasswordEle, val);
    await expect(confirmPasswordEle.value).toBe(val);
    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();

    const newPasswordError = await findByTestId('credentials.passcode-error');
    expect(newPasswordError.innerHTML).toBe('This field cannot be left blank');

    const passwordMatchesWrapper = await findByTestId('password-authenticator--matches') as HTMLDivElement;
    await within(passwordMatchesWrapper).findByRole('img', { name: 'incomplete' });
  });

  it('should not make network request when fields are not matching', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Your password has expired/);
    await findByText(/Password requirements/);

    const submitButton = await findByText('Change Password', { selector: 'button' });
    const newPasswordEle = await findByTestId('credentials.passcode') as HTMLInputElement;
    const confirmPasswordEle = await findByTestId('confirmPassword') as HTMLInputElement;

    const password = 'superSecretP@ssword12';
    await user.type(newPasswordEle, password);

    await user.type(confirmPasswordEle, 'abc123');

    const passwordMatchesWrapper = await findByTestId('password-authenticator--matches') as HTMLDivElement;
    await within(passwordMatchesWrapper).findByRole('img', { name: 'incomplete' });

    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
  });

  it('should not make network request without completing any password fields', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Your password has expired/);
    await findByText(/Password requirements/);

    const submitButton = await findByText('Change Password', { selector: 'button' });
    await findByTestId('credentials.passcode') as HTMLInputElement;
    await findByTestId('confirmPassword') as HTMLInputElement;

    const passwordMatchesWrapper = await findByTestId('password-authenticator--matches') as HTMLDivElement;
    await within(passwordMatchesWrapper).findByRole('img', { name: 'incomplete' });

    await user.click(submitButton);

    const newPasswordError = await findByTestId('credentials.passcode-error');
    const confirmPasswordError = await findByTestId('confirmPassword-error');

    expect(newPasswordError.innerHTML).toBe('This field cannot be left blank');
    expect(confirmPasswordError.innerHTML).toBe('This field cannot be left blank');
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
  });
});

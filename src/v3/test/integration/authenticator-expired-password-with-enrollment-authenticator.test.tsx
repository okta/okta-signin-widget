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
import { createAuthJsPayloadArgs, setup, updateDynamicAttribute } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/identify/authenticator-expired-password-with-enrollment-authenticator.json';

describe('authenticator-expired-password-with-enrollment-authenticator', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Your password has expired/);
    updateDynamicAttribute(container, ['aria-labelledby', 'id']);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByLabelText, findByText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Your password has expired/);
    await waitFor(() => expect(titleElement).toHaveFocus());
    await findByText(/Password requirements/);
    await findByText(/Return to authenticator list/);

    const submitButton = await findByText('Change Password', { selector: 'button' });
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
        credentials: { passcode: password },
      }),
    );
  });

  it('should present field level error message of (failed) password requirements', async () => {
    const {
      authClient, user, findByLabelText, findByText, container,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Your password has expired/);
    await waitFor(() => expect(titleElement).toHaveFocus());
    await findByText(/Password requirements/);

    const submitButton = await findByText('Change Password', { selector: 'button' });
    const newPasswordEle = await findByLabelText('New password') as HTMLInputElement;

    await user.type(newPasswordEle, 'abc');
    // Must blur field to trigger error
    await user.tab();

    expect(newPasswordEle).toHaveErrorMessage(/Password requirements were not met/);

    await user.click(submitButton);

    const confirmPasswordEle = await findByLabelText(/Re-enter password/) as HTMLInputElement;

    expect(confirmPasswordEle).toHaveErrorMessage(/This field cannot be left blank/);
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });
});

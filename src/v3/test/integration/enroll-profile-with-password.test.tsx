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

import mockResponse from '../../../../playground/mocks/data/idp/idx/enroll-profile-with-password.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('enroll-profile-with-password', () => {
  it('should render form', async () => {
    const { container, findByText, findByTestId } = await setup({ mockResponse });
    await findByText(/Sign up/);
    expect(container).toMatchSnapshot();
    const firstNameEle = await findByTestId('userProfile.firstName') as HTMLInputElement;
    expect(firstNameEle).not.toHaveFocus();
  });

  it('should display field level error when password field is required but is not filled', async () => {
    const {
      authClient, container, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByTestId('userProfile.firstName') as HTMLInputElement;
    const lastNameEle = await findByTestId('userProfile.lastName') as HTMLInputElement;
    const emailEle = await findByTestId('userProfile.email') as HTMLInputElement;

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'tester@okta1.com';
    await user.type(firstNameEle, firstName);
    await user.type(lastNameEle, lastName);
    await user.type(emailEle, email);

    expect(firstNameEle.value).toEqual(firstName);
    expect(lastNameEle.value).toEqual(lastName);
    expect(emailEle.value).toEqual(email);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
    const passwordFieldError = await findByTestId('credentials.passcode-error');
    expect(passwordFieldError.textContent).toEqual('This field cannot be left blank');
    expect(container).toMatchSnapshot();
  });

  it('should display field level error when password does not fulfill requirements', async () => {
    const {
      authClient, container, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByTestId('userProfile.firstName') as HTMLInputElement;
    const lastNameEle = await findByTestId('userProfile.lastName') as HTMLInputElement;
    const emailEle = await findByTestId('userProfile.email') as HTMLInputElement;
    const passwordEle = await findByTestId('credentials.passcode') as HTMLInputElement;

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'tester@okta1.com';
    const password = 'abc123';
    await user.type(firstNameEle, firstName);
    await user.type(lastNameEle, lastName);
    await user.type(emailEle, email);
    await user.type(passwordEle, password);

    expect(firstNameEle.value).toEqual(firstName);
    expect(lastNameEle.value).toEqual(lastName);
    expect(emailEle.value).toEqual(email);
    expect(passwordEle.value).toEqual(password);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
    const passwordFieldError = await findByTestId('credentials.passcode-error');
    expect(passwordFieldError.textContent).toContain('Password requirements were not met');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByText, findByTestId,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByTestId('userProfile.firstName') as HTMLInputElement;
    const lastNameEle = await findByTestId('userProfile.lastName') as HTMLInputElement;
    const emailEle = await findByTestId('userProfile.email') as HTMLInputElement;
    const passwordEle = await findByTestId('credentials.passcode') as HTMLInputElement;

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'tester@okta1.com';
    const password = 'abc123DE';
    await user.type(firstNameEle, firstName);
    await user.type(lastNameEle, lastName);
    await user.type(emailEle, email);
    await user.type(passwordEle, password);

    expect(firstNameEle.value).toEqual(firstName);
    expect(lastNameEle.value).toEqual(lastName);
    expect(emailEle.value).toEqual(email);
    expect(passwordEle.value).toEqual(password);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/enroll/new', {
        userProfile: {
          firstName,
          lastName,
          email,
        },
        credentials: { passcode: password },
        stateHandle: 'fake-stateHandle',
      }, 'application\\/json; okta-version=\\d+\\.\\d+\\.\\d+'),
    );
  });
});

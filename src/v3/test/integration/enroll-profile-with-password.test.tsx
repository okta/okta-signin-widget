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
    const { container, findByText, findByLabelText } = await setup({ mockResponse });
    await findByText(/Sign up/);
    expect(container).toMatchSnapshot();
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    expect(firstNameEle).not.toHaveFocus();
  });

  it('should display field level error when password field is required but is not filled', async () => {
    const {
      authClient, container, user, findByText, findByLabelText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    const lastNameEle = await findByLabelText('Last name') as HTMLInputElement;
    const emailEle = await findByLabelText('Email') as HTMLInputElement;

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
    const passwordEle = await findByLabelText('Password') as HTMLInputElement;
    expect(passwordEle).toHaveErrorMessage(/This field cannot be left blank/);
    expect(container).toMatchSnapshot();
  });

  it('should display field level error when password does not fulfill requirements', async () => {
    const {
      authClient, container, user, findByText, findByLabelText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    const lastNameEle = await findByLabelText('Last name') as HTMLInputElement;
    const emailEle = await findByLabelText('Email') as HTMLInputElement;
    const passwordEle = await findByLabelText('Password') as HTMLInputElement;

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
    expect(passwordEle).toHaveErrorMessage(/Password requirements were not met/);
    expect(container).toMatchSnapshot();
  });

  it('should display field level error when password includes username', async () => {
    const {
      authClient, container, user, findByText, findByLabelText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    const lastNameEle = await findByLabelText('Last name') as HTMLInputElement;
    const emailEle = await findByLabelText('Email') as HTMLInputElement;
    const passwordEle = await findByLabelText('Password') as HTMLInputElement;

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'tester@okta1.com';
    const password = 'abc123testerabcd243';
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
    expect(passwordEle).toHaveErrorMessage(/No parts of your username/);
    expect(container).toMatchSnapshot();
  });

  it('should display field level error when password includes first and last name', async () => {
    const mockResponseWithRequirements = {
      ...mockResponse,
      currentAuthenticator: {
        ...mockResponse.currentAuthenticator,
        value: {
          ...mockResponse.currentAuthenticator.value,
          settings: {
            ...mockResponse.currentAuthenticator.value.settings,
            complexity: {
              ...mockResponse.currentAuthenticator.value.settings.complexity,
              excludeAttributes: ['firstName', 'lastName'],
            },
          },
        }
      },
    };
    const {
      authClient, container, user, findByText, findByLabelText,
    } = await setup({ mockResponse: mockResponseWithRequirements });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    const lastNameEle = await findByLabelText('Last name') as HTMLInputElement;
    const emailEle = await findByLabelText('Email') as HTMLInputElement;
    const passwordEle = await findByLabelText('Password') as HTMLInputElement;

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'oktauser@okta1.com';
    const password = 'Abc123testerabcd243mctesterson$534534sdfa';
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
    expect(passwordEle).toHaveErrorMessage(/Does not include your first name/);
    expect(passwordEle).toHaveErrorMessage(/Does not include your last name/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByText, findByLabelText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Sign up/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    const lastNameEle = await findByLabelText('Last name') as HTMLInputElement;
    const emailEle = await findByLabelText('Email') as HTMLInputElement;
    const passwordEle = await findByLabelText('Password') as HTMLInputElement;

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

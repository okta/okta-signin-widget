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

import { setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/enroll/default.json';

describe('enroll-profile', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Sign up/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Sign up/);

    const submitButton = await findByTestId('submit');
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
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-8425965.oktapreview.com/idp/idx/enroll/new',
      {
        data: JSON.stringify({
          userProfile: {
            firstName,
            lastName,
            email,
          },
          stateHandle: 'fake-stateHandle',
        }),
        headers: {
          Accept: 'application/json; okta-version=1.0.0',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
        },
        withCredentials: true,
      },
    );
  });

  it('fails client side validation with empty fields', async () => {
    const {
      authClient, user, findByTestId,
    } = await setup({ mockResponse });

    const submitButton = await findByTestId('submit');

    await user.click(submitButton);
    const firstNameError = await findByTestId('userProfile.firstName-error');
    expect(firstNameError.textContent).toEqual('This field cannot be left blank');
    const lastNameError = await findByTestId('userProfile.lastName-error');
    expect(lastNameError.textContent).toEqual('This field cannot be left blank');
    const emailError = await findByTestId('userProfile.email-error');
    expect(emailError.textContent).toEqual('This field cannot be left blank');

    expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
      'POST',
      'https://oie-8425965.oktapreview.com/idp/idx/enroll/new',
      expect.anything(),
    );
  });
});

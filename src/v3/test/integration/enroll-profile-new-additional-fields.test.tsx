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

import mockResponse from '@okta/mocks/data/idp/idx/enroll-profile-new-additional-fields.json';
import { waitFor, fireEvent } from '@testing-library/preact';
import { createAuthJsPayloadArgs, setup } from './util';

describe('enroll-profile-new-additional-fields', () => {
  it('should render form', async () => {
    const { container, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Sign up');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByTestId, findByRole,
    } = await setup({ mockResponse });

    const heading = await findByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Sign up');

    const submitButton = await findByRole('button', { name: 'Sign Up' });
    const firstNameEle = await findByTestId('userProfile.firstName') as HTMLInputElement;
    const lastNameEle = await findByTestId('userProfile.lastName') as HTMLInputElement;
    const emailEle = await findByTestId('userProfile.email') as HTMLInputElement;
    const countryEle = await findByTestId('userProfile.country') as HTMLSelectElement;
    const countryCodeEle = await findByTestId('userProfile.countryCode') as HTMLInputElement;
    const timezoneEle = await findByTestId('userProfile.timezone') as HTMLInputElement;

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'tester@okta1.com';
    const country = 'US';
    const countryCode = 'USA';
    const timezone = 'EST';
    await waitFor(() => expect(firstNameEle).toHaveFocus());
    await user.type(firstNameEle, firstName);
    await user.type(lastNameEle, lastName);
    await user.type(emailEle, email);
    fireEvent.change(countryEle, { target: { value: country } });
    await user.type(countryCodeEle, countryCode);
    await user.type(timezoneEle, timezone);

    expect(firstNameEle.value).toEqual(firstName);
    expect(lastNameEle.value).toEqual(lastName);
    expect(emailEle.value).toEqual(email);
    expect(countryEle.value).toEqual(country);
    expect(countryCodeEle.value).toEqual(countryCode);
    expect(timezoneEle.value).toEqual(timezone);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/enroll/new', {
        stateHandle: 'fake-stateHandle',
        userProfile: {
          firstName,
          lastName,
          email,
          country,
          countryCode,
          timezone,
        },
      }, 'application/vnd.okta.v1+json'),
    );
  });

  it('fails client side validation with empty required fields', async () => {
    const {
      authClient, container, user, findByRole, findByTestId,
    } = await setup({ mockResponse });

    const submitButton = await findByRole('button', { name: 'Sign Up' });

    await user.click(submitButton);
    const firstNameError = await findByTestId('userProfile.firstName-error');
    expect(firstNameError.textContent).toEqual('This field cannot be left blank');
    const lastNameError = await findByTestId('userProfile.lastName-error');
    expect(lastNameError.textContent).toEqual('This field cannot be left blank');
    const emailError = await findByTestId('userProfile.email-error');
    expect(emailError.textContent).toEqual('This field cannot be left blank');

    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });
});

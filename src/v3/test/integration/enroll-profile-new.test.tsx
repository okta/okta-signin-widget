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

import mockResponse from '../../../../playground/mocks/data/idp/idx/enroll-profile-new.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('enroll-profile-new', () => {
  it('should render form', async () => {
    const { container, findByText, findByLabelText } = await setup({ mockResponse });
    await findByText(/Sign up/);
    expect(container).toMatchSnapshot();
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    expect(firstNameEle).not.toHaveFocus();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByLabelText, findByText,
    } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

    await findByText(/Sign up/);

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    const lastNameEle = await findByLabelText('Last name') as HTMLInputElement;
    const emailEle = await findByLabelText('Email') as HTMLInputElement;

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'tester@okta1.com';
    await waitFor(() => expect(lastNameEle).toHaveFocus());
    await user.type(firstNameEle, firstName);
    await user.type(lastNameEle, lastName);
    await user.type(emailEle, email);

    expect(firstNameEle.value).toEqual(firstName);
    expect(lastNameEle.value).toEqual(lastName);
    expect(emailEle.value).toEqual(email);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/enroll/new', {
        stateHandle: 'fake-stateHandle',
        userProfile: {
          lastName,
          firstName,
          email,
        },
      }, 'application/vnd.okta.v1+json'),
    );
  });

  it('fails client side validation with empty fields', async () => {
    const {
      authClient, user, findByLabelText, findByText,
    } = await setup({ mockResponse });

    const submitButton = await findByText('Sign Up', { selector: 'button' });

    await user.click(submitButton);
    const firstNameEle = await findByLabelText('First name') as HTMLInputElement;
    const lastNameEle = await findByLabelText('Last name') as HTMLInputElement;
    const emailEle = await findByLabelText('Email') as HTMLInputElement;
    expect(firstNameEle).toHaveErrorMessage(/This field cannot be left blank/);
    expect(lastNameEle).toHaveErrorMessage(/This field cannot be left blank/);
    expect(emailEle).toHaveErrorMessage(/This field cannot be left blank/);

    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
  });
});

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

import {
  RegistrationDataCallbackV3,
  RegistrationElementSchema,
  RegistrationSchemaCallbackV3,
} from 'src/types';
import { IdxActionParams } from '@okta/okta-auth-js';
import { within, waitFor } from '@testing-library/preact';
import enrollProfileTerminalResponse from '../../../../playground/mocks/data/idp/idx/terminal-registration.json';
import enrollProfileResponse from '../../../../playground/mocks/data/idp/idx/enroll-profile.json';
import { createAuthJsPayloadArgs, setup } from './util';
import { RegistrationErrorCallback, RegistrationPostSubmitCallback } from '../../../types';

describe('enroll-profile-with-password', () => {
  it('should add new field to view and remove it from the payload before submission', async () => {
    const mockExternalApi = jest.fn();
    const {
      authClient, container, user, findByRole, findByLabelText, findByText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: enrollProfileResponse,
          status: 200,
        },
        '/idp/idx/enroll': {
          data: enrollProfileTerminalResponse,
          status: 200,
        },
      },
      widgetOptions: {
        registration: {
          parseSchema: (
            schema: RegistrationElementSchema[],
            onSuccess: RegistrationSchemaCallbackV3,
          ) => {
            schema.push({
              name: 'userProfile.address',
              type: 'text',
              placeholder: 'Enter your street address',
              maxLength: 255,
              'label-top': true,
              label: 'Street Address',
              required: true,
              wide: true,
              sublabel: 'Use your home address',
            });
            onSuccess(schema);
          },
          preSubmit: (
            postData: IdxActionParams,
            onSuccess: RegistrationDataCallbackV3,
          ) => {
            mockExternalApi((postData.userProfile as any).address);
            // eslint-disable-next-line no-param-reassign
            delete (postData.userProfile as any).address;
            onSuccess(postData);
          },
          postSubmit: (
            response: string,
            onSuccess: RegistrationPostSubmitCallback,
          ) => {
            mockExternalApi(response);
            onSuccess(response);
          },
        },
      },
    });
    const heading = await findByRole('heading', { level: 2 });
    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText(/First name/) as HTMLInputElement;
    const lastNameEle = await findByLabelText(/Last name/) as HTMLInputElement;
    const emailEle = await findByLabelText(/Email/) as HTMLInputElement;
    const addressEle = await findByLabelText(/Street Address/) as HTMLInputElement;

    await waitFor(() => expect(heading).toHaveFocus());
    expect(heading.textContent).toBe('Sign up');
    expect(container).toMatchSnapshot();

    const firstName = 'tester';
    const lastName = 'McTesterson';
    const email = 'tester@okta1.com';
    const address = '123 Main St';
    await user.type(firstNameEle, firstName);
    await user.type(lastNameEle, lastName);
    await user.type(emailEle, email);
    await user.type(addressEle, address);

    expect(firstNameEle.value).toEqual(firstName);
    expect(lastNameEle.value).toEqual(lastName);
    expect(emailEle.value).toEqual(email);
    expect(addressEle.value).toEqual(address);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/enroll', {
        stateHandle: 'fake-stateHandle',
        userProfile: {
          firstName,
          lastName,
          email,
        },
      }, 'application/vnd.okta.v1+json'),
    );
    await findByText(/To finish signing in/);
    expect(mockExternalApi).toHaveBeenCalledTimes(2);
    expect(mockExternalApi).toHaveBeenNthCalledWith(1, address);
    expect(mockExternalApi).toHaveBeenNthCalledWith(2, email);
  });

  it('should show custom field level error message and custom global message on page load', async () => {
    const {
      container, findByRole, findByTestId,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: enrollProfileResponse,
          status: 200,
        },
        '/idp/idx/enroll': {
          data: enrollProfileTerminalResponse,
          status: 200,
        },
      },
      widgetOptions: {
        registration: {
          parseSchema: (
            _schema: RegistrationElementSchema[],
            _onSuccess: RegistrationSchemaCallbackV3,
            onFailure: RegistrationErrorCallback,
          ) => {
            const error = {
              errorSummary: 'This is my custom global message',
              errorCauses: [{
                property: 'userProfile.lastName',
                errorSummary: 'Custom parseSchema error',
              }],
            };
            onFailure(error);
          },
        },
      },
    });
    const heading = await findByRole('heading', { level: 2 });
    const lastNameFieldError = await findByTestId('userProfile.lastName-error');

    expect(heading.textContent).toBe('Sign up');
    expect(lastNameFieldError.textContent).toContain('Custom parseSchema error');
    expect(container).toMatchSnapshot();
  });

  it('should show custom error message and prevent submission when failure is triggered in preSubmit callback', async () => {
    const {
      authClient, container, user, findByRole, findByLabelText, findByText, findByTestId,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: enrollProfileResponse,
          status: 200,
        },
        '/idp/idx/enroll': {
          data: enrollProfileTerminalResponse,
          status: 200,
        },
      },
      widgetOptions: {
        registration: {
          preSubmit: (
            _postData: IdxActionParams,
            _onSuccess: RegistrationDataCallbackV3,
            onFailure: RegistrationErrorCallback,
          ) => {
            const error = {
              errorSummary: 'This is my custom global message',
              errorCauses: [{
                property: 'userProfile.lastName',
                errorSummary: 'Custom preSubmit error',
              }],
            };
            onFailure(error);
          },
        },
      },
    });
    const heading = await findByRole('heading', { level: 2 });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(heading.textContent).toBe('Sign up');

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText(/First name/) as HTMLInputElement;
    const lastNameEle = await findByLabelText(/Last name/) as HTMLInputElement;
    const emailEle = await findByLabelText(/Email/) as HTMLInputElement;

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
    const lastNameFieldError = await findByTestId('userProfile.lastName-error');
    expect(lastNameFieldError.textContent).toContain('Custom preSubmit error');
    expect(container).toMatchSnapshot();
  });

  it('should show generic error message and prevent updated view rendering when failure is triggered in postSubmit callback', async () => {
    const {
      authClient, container, user, findByRole, findByLabelText, findByText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: enrollProfileResponse,
          status: 200,
        },
        '/idp/idx/enroll': {
          data: enrollProfileTerminalResponse,
          status: 200,
        },
      },
      widgetOptions: {
        registration: {
          postSubmit: (
            _response: string,
            _onSuccess: RegistrationPostSubmitCallback,
            onFailure: RegistrationErrorCallback,
          ) => {
            // @ts-expect-error customers can pass nothing into the function
            // so we must attempt to do the same to show we can handle it
            onFailure();
          },
        },
      },
    });
    const heading = await findByRole('heading', { level: 2 });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(heading.textContent).toBe('Sign up');

    const submitButton = await findByText('Sign Up', { selector: 'button' });
    const firstNameEle = await findByLabelText(/First name/) as HTMLInputElement;
    const lastNameEle = await findByLabelText(/Last name/) as HTMLInputElement;
    const emailEle = await findByLabelText(/Email/) as HTMLInputElement;

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
      ...createAuthJsPayloadArgs('POST', 'idp/idx/enroll', {
        stateHandle: 'fake-stateHandle',
        userProfile: {
          firstName,
          lastName,
          email,
        },
      }, 'application/vnd.okta.v1+json'),
    );
    const alertBox = await findByRole('alert') as HTMLDivElement;
    within(alertBox).findByText(/We could not process your registration at this time. Please try again later./);
    expect(container).toMatchSnapshot();
  });

  it('should show validation error messages on all fields when submitted without completing required fields', async () => {
    const {
      authClient, container, user, findByRole, findByText, findByTestId,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: enrollProfileResponse,
          status: 200,
        },
        '/idp/idx/enroll': {
          data: enrollProfileTerminalResponse,
          status: 200,
        },
      },
      widgetOptions: {
        registration: {
          parseSchema: (
            schema: RegistrationElementSchema[],
            onSuccess: RegistrationSchemaCallbackV3,
          ) => {
            schema.push({
              name: 'userProfile.address',
              type: 'text',
              placeholder: 'Enter your street address',
              maxLength: 255,
              'label-top': true,
              label: 'Street Address',
              required: true,
              wide: true,
              sublabel: 'Use your home address',
            });
            onSuccess(schema);
          },
        },
      },
    });
    const heading = await findByRole('heading', { level: 2 });
    const submitButton = await findByText('Sign Up', { selector: 'button' });

    expect(heading.textContent).toBe('Sign up');

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith('POST', 'idp/idx/enroll');
    const addressError = await findByTestId('userProfile.address-error');
    expect(addressError.textContent).toContain('This field cannot be left blank');
    expect(container).toMatchSnapshot();
  });
});

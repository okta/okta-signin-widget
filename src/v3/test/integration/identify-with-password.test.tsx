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

import * as cookieUtils from '../../src/util/cookieUtils';
import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';
import { WidgetOptions } from '../../../types';
import { mockMathRandom } from '../utils/mockMathRandom';

describe('identify-with-password', () => {
  beforeEach(() => {
    mockMathRandom();
  });

  it('should display Identifier & Password hint labels', async () => {
    const usernameHint = 'This is your username';
    const passwordHint = 'This is your password';
    const hintOverrides: WidgetOptions['i18n'] = {
      en: {
        'primaryauth.username.tooltip': usernameHint,
        'primaryauth.password.tooltip': passwordHint,
      },
    };
    const {
      findByLabelText, findByText,
    } = await setup({
      mockResponse,
      widgetOptions: {
        i18n: hintOverrides,
      },
    });

    await findByText('Sign in', { selector: 'button' });
    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
    const passwordEl = await findByLabelText('Password') as HTMLInputElement;

    expect(usernameEl).toHaveAccessibleDescription(usernameHint);
    expect(passwordEl).toHaveAccessibleDescription(passwordHint);
  });

  it('renders the loading state first', async () => {
    const { container, findByLabelText } = await setup({ mockResponse });
    await findByLabelText('Processing...');
    expect(container).toMatchSnapshot();
  });

  it('renders form with focus', async () => {
    const { container, findByLabelText } = await setup({ mockResponse });
    const inputEle = await findByLabelText(/Username/) as HTMLInputElement;
    expect(container).toMatchSnapshot();
    expect(inputEle).not.toHaveFocus();
  });

  it('renders form without focus', async () => {
    const { container, findByLabelText } = await setup({
      mockResponse, widgetOptions: { features: { autoFocus: true } },
    });
    const inputEle = await findByLabelText(/Username/) as HTMLInputElement;
    expect(container).toMatchSnapshot();
    await waitFor(() => expect(inputEle).toHaveFocus());
  });

  it('should pre-populate username into identifier field when set in widget config props', async () => {
    const mockUsername = 'testuser@okta1.com';
    const {
      findByLabelText,
    } = await setup({
      mockResponse,
      widgetOptions: { username: mockUsername },
    });

    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;

    expect(usernameEl.value).toBe(mockUsername);
  });

  it('should pre-populate username into identifier field when set in cookie', async () => {
    const mockUsername = 'testuser@okta1.com';
    jest.spyOn(cookieUtils, 'getUsernameCookie').mockReturnValue(mockUsername);
    const {
      findByLabelText,
    } = await setup({
      mockResponse,
      widgetOptions: { features: { rememberMe: true } },
    });

    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;

    expect(usernameEl.value).toBe(mockUsername);
  });

  describe('Client-side field change validation tests', () => {
    it('should attempt to submit page with all required fields empty', async () => {
      const {
        authClient,
        user,
        container,
        findByTestId,
        findByText,
        findByLabelText,
      } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

      const identifierEl = await findByLabelText(/Username/) as HTMLInputElement;
      await findByTestId('credentials.passcode') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });

      await user.click(submitButton);
      await findByText(/We found some errors./);
      const passwordEle = await findByLabelText('Password') as HTMLInputElement;

      expect(identifierEl).toHaveErrorMessage(/This field cannot be left blank/);
      expect(container).toMatchSnapshot();
      expect(passwordEle).toHaveErrorMessage(/This field cannot be left blank/);
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
    });

    it('should attempt to submit page with all required fields empty and type in one of the required fields to remove error', async () => {
      const {
        authClient,
        user,
        container,
        findByTestId,
        findByText,
        findByLabelText,
      } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

      const identifierEl = await findByLabelText(/Username/) as HTMLInputElement;
      await findByTestId('credentials.passcode') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });

      await user.click(submitButton);
      await findByText(/We found some errors./);
      const passwordEle = await findByLabelText('Password') as HTMLInputElement;

      expect(identifierEl).toHaveErrorMessage(/This field cannot be left blank/);
      expect(container).toMatchSnapshot();
      expect(passwordEle).toHaveErrorMessage(/This field cannot be left blank/);
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();

      await user.type(identifierEl, 'someuser@okta1.com');

      expect(identifierEl).not.toHaveErrorMessage();
      expect(passwordEle).toHaveErrorMessage(/This field cannot be left blank/);
    });

    it('should type in field, then clear field to view field level error', async () => {
      const {
        user,
        findByLabelText,
        findByTestId,
        queryByTestId,
        findByText,
      } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

      const identifierEl = await findByLabelText(/Username/) as HTMLInputElement;
      await findByTestId('credentials.passcode') as HTMLInputElement;
      await findByText('Sign in', { selector: 'button' });
      expect(identifierEl).not.toHaveErrorMessage();
      expect(queryByTestId('credentials.passcode-error')).toBeNull();

      await user.type(identifierEl, 'aaa');
      await user.clear(identifierEl);
      await user.tab();

      expect(identifierEl).toHaveErrorMessage(/This field cannot be left blank/);
      expect(queryByTestId('credentials.passcode-error')).toBeNull();
    });

    it('fails client side validation with no inputs', async () => {
      const {
        authClient,
        user,
        container,
        findByText,
        findByLabelText,
      } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

      const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
      const passwordEl = await findByLabelText('Password') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });

      // empty username & empty password
      await user.click(submitButton);
      await findByText(/We found some errors./);
      expect(usernameEl).toHaveErrorMessage(/This field cannot be left blank/);
      expect(container).toMatchSnapshot();

      expect(passwordEl).toHaveErrorMessage(/This field cannot be left blank/);
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();

      // add username - updates field level error
      await user.type(usernameEl, 'testuser@okta.com');
      await user.click(submitButton);
      await waitFor(async () => {
        expect(usernameEl).not.toHaveErrorMessage();
        expect(passwordEl).toHaveErrorMessage(/This field cannot be left blank/);
        expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
      });

      // add password - clears error and send payload
      await user.type(passwordEl, 'fake-password');
      await user.click(submitButton);
      await waitFor(async () => {
        expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
          ...createAuthJsPayloadArgs('POST', 'idp/idx/identify', {
            identifier: 'testuser@okta.com',
            credentials: {
              passcode: 'fake-password',
            },
          }),
        );
        expect(usernameEl).not.toHaveErrorMessage();
        expect(passwordEl).not.toHaveErrorMessage();
      });
    });
  });

  describe('sends correct payload', () => {
    it('with all required fields', async () => {
      const {
        authClient,
        user,
        findByLabelText,
        findByText,
      } = await setup({ mockResponse });

      await waitFor(async () => expect(await findByText('Sign In', { selector: 'h2' })).toHaveFocus());
      const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
      const passwordEl = await findByLabelText('Password') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });

      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');
      await user.type(passwordEl, 'fake-password');
      expect(passwordEl.value).toEqual('fake-password');
      await user.click(submitButton);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/identify', {
          identifier: 'testuser@okta.com',
          credentials: {
            passcode: 'fake-password',
          },
        }),
      );
    });

    it('should modify username for PRIMARY_AUTH operation when transformUsername function is defined', async () => {
      const {
        authClient,
        user,
        findByLabelText,
        findByText,
      } = await setup({
        mockResponse,
        widgetOptions: {
          transformUsername: (username: string, operation) => (
            operation === 'PRIMARY_AUTH' ? username.split('@')[0] : username
          ),
        },
      });

      await waitFor(async () => expect(await findByText('Sign In', { selector: 'h2' })).toHaveFocus());
      const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
      const passwordEl = await findByLabelText('Password') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });
      const mockUsername = 'testuser@okta1.com';

      await user.type(usernameEl, mockUsername);
      expect(usernameEl.value).toEqual(mockUsername);
      await user.type(passwordEl, 'fake-password');
      expect(passwordEl.value).toEqual('fake-password');
      await user.click(submitButton);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/identify', {
          identifier: 'testuser',
          credentials: { passcode: 'fake-password' },
        }),
      );
    });

    it('should not modify username for when operation is PRIMARY_AUTH as defined in transformUsername function', async () => {
      const {
        authClient,
        user,
        findByLabelText,
        findByText,
      } = await setup({
        mockResponse,
        widgetOptions: {
          transformUsername: (username: string, operation) => (
            operation === 'PRIMARY_AUTH' ? username : 'DUMMY_USERNAME'
          ),
        },
      });

      await waitFor(async () => expect(await findByText('Sign In', { selector: 'h2' })).toHaveFocus());
      const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
      const passwordEl = await findByLabelText('Password') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });
      const mockUsername = 'testuser@okta1.com';

      await user.type(usernameEl, mockUsername);
      expect(usernameEl.value).toEqual(mockUsername);
      await user.type(passwordEl, 'fake-password');
      expect(passwordEl.value).toEqual('fake-password');
      await user.click(submitButton);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/identify', {
          identifier: mockUsername,
          credentials: { passcode: 'fake-password' },
        }),
      );
    });

    it('should not remove padded spaces from password', async () => {
      const {
        authClient,
        user,
        findByLabelText,
        findByText,
      } = await setup({ mockResponse });

      await waitFor(async () => expect(await findByText('Sign In', { selector: 'h2' })).toHaveFocus());
      const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
      const passwordEl = await findByLabelText('Password') as HTMLInputElement;
      const submitButton = await findByText('Sign in', { selector: 'button' });

      const password = '   fake-password   ';
      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');
      await user.type(passwordEl, password);
      expect(passwordEl.value).toEqual(password);
      await user.click(submitButton);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/identify', {
          identifier: 'testuser@okta.com',
          credentials: {
            passcode: password,
          },
        }),
      );
    });

    it('with required fields + optional fields', async () => {
      const {
        authClient,
        user,
        findByLabelText,
        findByTestId,
        findByText,
      } = await setup({ mockResponse });

      await waitFor(async () => expect(await findByText('Sign In', { selector: 'h2' })).toHaveFocus());
      const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
      const passwordEl = await findByLabelText('Password') as HTMLInputElement;
      const rememberMeEl = await findByTestId('rememberMe');
      const submitButton = await findByText('Sign in', { selector: 'button' });

      await user.type(usernameEl, 'testuser@okta.com');
      expect(usernameEl.value).toEqual('testuser@okta.com');
      await user.type(passwordEl, 'fake-password');
      expect(passwordEl.value).toEqual('fake-password');
      await user.click(rememberMeEl);
      await user.click(submitButton);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/identify', {
          identifier: 'testuser@okta.com',
          credentials: {
            passcode: 'fake-password',
          },
          rememberMe: true,
        }),
      );
    });
  });

  it('should only send one api request when submit button is double clicked', async () => {
    const {
      authClient,
      user,
      findByLabelText,
      findByText,
    } = await setup({ mockResponse });

    await waitFor(async () => expect(await findByText('Sign In', { selector: 'h2' })).toHaveFocus());
    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
    const passwordEl = await findByLabelText('Password') as HTMLInputElement;
    const submitButton = await findByText('Sign in', { selector: 'button' });

    await user.type(usernameEl, 'testuser@okta.com');
    expect(usernameEl.value).toEqual('testuser@okta.com');
    await user.type(passwordEl, 'fake-password');
    expect(passwordEl.value).toEqual('fake-password');
    await user.dblClick(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledTimes(1);
  });

  it('should only send one api request when forgot password link is double clicked', async () => {
    const {
      findByText,
      user,
      authClient,
    } = await setup({ mockResponse });

    const cancelLink = await findByText(/Forgot password?/);

    await user.dblClick(cancelLink);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledTimes(1);
  });

  it('identifier and password fields should be ltr even when a rtl language is set', async () => {
    const {
      findByLabelText,
    } = await setup({ mockResponse, widgetOptions: { language: 'ar' } });

    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
    const passwordEl = await findByLabelText('Password') as HTMLInputElement;

    expect(usernameEl.parentElement).toHaveStyle('direction: ltr');
    expect(passwordEl.parentElement).toHaveStyle('direction: ltr');
  });
});

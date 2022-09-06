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

import { act } from 'preact/test-utils';
import { within } from '@testing-library/preact';
import { setup } from './util';

import authenticatorVerificationEmail from '../../src/mocks/response/idp/idx/challenge/default.json';
import authenticatorVerificationEmailInvalidOtp from '../../src/mocks/response/idp/idx/challenge/error-401-invalid-otp-passcode.json';
import sessionExpiredResponse from '../../src/mocks/response/idp/idx/identify/error-session-expired.json';

describe('authenticator-verification-email', () => {
  describe('renders correct form', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('renders the initial form', async () => {
      const {
        authClient, container, findByText,
      } = await setup({
        mockResponse: authenticatorVerificationEmail,
      });

      // renders the form
      await findByText(/Verify with your email/);
      expect(container).toMatchSnapshot();

      // running polling
      jest.advanceTimersByTime(5000 /* refresh: 4000 */);
      await findByText(/Verify with your email/);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/poll',
        {
          data: JSON.stringify({
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

    it('renders the initial form with resend alert box', async () => {
      const {
        container, findByText,
      } = await setup({
        mockResponse: authenticatorVerificationEmail,
      });

      // renders the form
      await findByText(/Verify with your email/);
      act(() => {
        jest.advanceTimersByTime(31_000);
      });
      expect(container).toMatchSnapshot();
    });

    it('renders the otp challenge form', async () => {
      const {
        authClient,
        container,
        user,
        findByText,
        findByTestId,
        queryByText,
      } = await setup({
        mockResponses: {
          '/introspect': {
            data: authenticatorVerificationEmail,
            status: 200,
          },
          '/challenge/poll': {
            data: authenticatorVerificationEmail,
            status: 200,
          },
          '/challenge/answer': {
            data: authenticatorVerificationEmailInvalidOtp,
            status: 401,
          },
        },
      });
      await findByText(/Verify with your email/);

      // render otp challenge form
      const nextPageBtn = await findByText(/Enter a code from the email instead/);
      await user.click(nextPageBtn);
      await findByText(/Enter Code/);
      expect(container).toMatchSnapshot();

      // allow polling request to be triggered
      jest.advanceTimersByTime(5000 /* refresh: 4000 */);
      await findByText(/Enter Code/);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/poll',
        {
          data: JSON.stringify({
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

      act(() => {
        jest.advanceTimersByTime(31_000);
      });
      await findByText(/Haven't received an email?/);
      // render invalid otp message
      const codeEle = await findByTestId('credentials.passcode') as HTMLInputElement;
      const submitButton = await findByText('Verify', { selector: 'button' });
      const verificationCode = '123456';
      await user.type(codeEle, verificationCode);
      await user.click(submitButton);
      await findByText('Invalid code. Try again.');
      // After an error, verify that the Reminder prompt is removed in lieu of the global error
      expect(queryByText(/Haven't received an email?/)).toBeNull();
      await findByText(/We found some errors./);
      expect(container).toMatchSnapshot();

      // allow polling request to be triggered
      jest.advanceTimersByTime(5000 /* refresh: 4000 */);
      await findByText('Invalid code. Try again.');
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/poll',
        {
          data: JSON.stringify({
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

    it('should render session expired terminal view when polling results in expired session', async () => {
      const {
        container,
        findByText,
        findByTestId,
      } = await setup({
        mockResponses: {
          '/introspect': {
            data: authenticatorVerificationEmail,
            status: 200,
          },
          '/challenge/poll': {
            data: sessionExpiredResponse,
            status: 401,
          },
        },
      });
      await findByText(/Verify with your email/);

      // allow polling request to be triggered
      jest.advanceTimersByTime(5000 /* refresh: 4000 */);

      const errorAlert = await findByTestId('infobox-error');
      await within(errorAlert).findByText(/You have been logged out due to inactivity/);

      expect(container).toMatchSnapshot();
    });
  });

  it('should send correct payload', async () => {
    const {
      authClient,
      user,
      findByText,
      findByTestId,
    } = await setup({
      mockResponse: authenticatorVerificationEmail,
    });

    await findByText(/Verify with your email/);
    await findByText(/We sent an email to/);

    const nextPageBtn = await findByText(/Enter a code from the email instead/);

    await user.click(nextPageBtn);
    await findByText(/Enter Code/);

    const codeEle = await findByTestId('credentials.passcode') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    const verificationCode = '123456';
    await user.type(codeEle, verificationCode);
    expect(codeEle.value).toEqual(verificationCode);
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'http://localhost:3000/idp/idx/challenge/answer',
      {
        data: JSON.stringify({
          credentials: {
            passcode: verificationCode,
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
});

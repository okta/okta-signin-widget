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

import mockResponse from '../../src/mocks/response/idp/idx/challenge/verify-ov-code-mfa.json';

describe('authenticator-verification-okta-verify-totp', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Enter a code/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByLabelText, findByText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Enter a code/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Verify', { selector: 'button' });
    const otpEle = await findByLabelText('Enter code from Okta Verify app') as HTMLInputElement;

    const totp = '123456';
    await user.type(otpEle, totp);

    expect(otpEle.value).toEqual(totp);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { totp },
      }),
    );
  });

  it('should send correct payload when totp is padded with non-breaking spaces', async () => {
    const {
      authClient, user, findByLabelText, findByText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Enter a code/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const submitButton = await findByText('Verify', { selector: 'button' });
    const otpEle = await findByLabelText('Enter code from Okta Verify app') as HTMLInputElement;

    const totp = '123456';
    const totpWithNonBreakingSpaces = `\u00A0${totp}\u00A0`;
    await user.type(otpEle, totpWithNonBreakingSpaces);

    expect(otpEle.value).toEqual(totpWithNonBreakingSpaces);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { totp },
      }),
    );
  });

  it('should have autocomplete attribute on totp input element when in ios browser', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      { userAgent: 'iPhone' } as unknown as Navigator,
    );
    const {
      container, findByLabelText, findByText,
    } = await setup({ mockResponse });

    await findByText(/Enter a code/);

    const otpEle = await findByLabelText('Enter code from Okta Verify app') as HTMLInputElement;

    expect(otpEle.getAttribute('autocomplete')).toBe('one-time-code');
    expect(container).toMatchSnapshot();
  });
});

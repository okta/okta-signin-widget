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
import mockResponse from '../../src/mocks/response/idp/idx/challenge/authenticator-verification-email-magic-link-false.json';

describe('Email authenticator verification when email magic link = false Tests', () => {
  it('should render form', async () => {
    const {
      container,
      authClient,
      user,
      findByText,
      findByLabelText,
      findByRole,
    } = await setup({
      mockResponse,
    });

    await waitFor(async () => expect(await findByRole('heading', { level: 1 })).toHaveFocus());
    const headerEle = await findByRole('heading', { level: 1 });
    expect(headerEle.textContent).toBe('Verify with your email');
    expect(container).toMatchSnapshot();

    const codeEle = await findByLabelText('Enter Code') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    const verificationCode = '123456';
    await user.type(codeEle, verificationCode);
    expect(codeEle.value).toEqual(verificationCode);
    await user.click(submitButton);

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: { passcode: verificationCode },
      }),
    );
  });
});

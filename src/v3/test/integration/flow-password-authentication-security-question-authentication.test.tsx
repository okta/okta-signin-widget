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

import identifyWithPassword from '@okta/mocks/data/idp/idx/authenticator-verification-password.json';

import authenticatorSecurityQuestion from '../../src/mocks/response/idp/idx/identify/securityquestion-verify.json';
import { setup } from './util';

describe('Flow transition from password authentication to security question authentication', () => {
  it('clears field data when transition from identify-with-password to authentication-verification-ga', async () => {
    const {
      user,
      findByTestId,
      findByText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: identifyWithPassword,
          status: 200,
        },
        '/idx/challenge/answer': {
          data: authenticatorSecurityQuestion,
          status: 200,
        },
      },
    });

    // form: identify with password
    const passwordEl = await findByTestId('credentials.passcode') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    await user.type(passwordEl, 'fake-password');
    expect(passwordEl.value).toEqual('fake-password');
    await user.click(submitButton);

    // form: verify with security question
    await findByText(/Verify with your Security Question/);
    const securityQuestionEl = await findByTestId('credentials.answer') as HTMLInputElement;
    expect(securityQuestionEl.value).toEqual('');
  });
});

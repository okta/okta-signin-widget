/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

import * as cookieUtils from '../../src/util/cookieUtils';
import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';
import wrongPasswordMockResponse from '../../src/mocks/response/idp/idx/identify/error-wrong-password.json';

// Lives in its own file: the integration harness keeps auth-js transaction state for the
// lifetime of a test file, so a flow that submits a remediation is only reliable as the
// first setup() in that file.
describe('identify-with-password-error-field-association', () => {
  it('should not associate either field with the form-level error after a failed sign in', async () => {
    jest.spyOn(cookieUtils, 'getUsernameCookie').mockReturnValue('testuser@okta1.com');
    const {
      container,
      user,
      findByText,
      findByLabelText,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: mockResponse,
          status: 200,
        },
        '/idp/idx/identify': {
          data: wrongPasswordMockResponse,
          status: 401,
        },
      },
      widgetOptions: { features: { rememberMe: true } },
    });

    const submitButton = await findByText('Sign in', { selector: 'button' });
    const initialUsernameEl = await findByLabelText('Username') as HTMLInputElement;
    const initialPasswordEl = await findByLabelText('Password') as HTMLInputElement;

    await user.clear(initialUsernameEl);
    await user.type(initialUsernameEl, 'testuser@okta1.com');
    await user.type(initialPasswordEl, 'wrongPassword1234');
    await user.click(submitButton);

    await findByText('Unable to sign in');

    const describedText = (el: HTMLElement) => (el.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .filter(Boolean)
      .map((id) => container.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ');

    const usernameEl = await findByLabelText('Username') as HTMLInputElement;
    const passwordEl = await findByLabelText('Password') as HTMLInputElement;

    // A failed credential check on the combined form is not attributable to either field.
    // Associating or invalidating one would imply the other was accepted, which is a
    // user-enumeration signal. The error stays form-level.
    expect(describedText(usernameEl)).not.toContain('Unable to sign in');
    expect(describedText(passwordEl)).not.toContain('Unable to sign in');
    expect(usernameEl.getAttribute('aria-invalid')).toBe('false');
    expect(passwordEl.getAttribute('aria-invalid')).toBe('false');
  });
});

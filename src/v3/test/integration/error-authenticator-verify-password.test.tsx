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

import mockResponse from '../../../../playground/mocks/data/idp/idx/error-401-authenticator-verify-password-generic.json';

describe('error-authenticator-verify-password', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });

    await findByText(/Unable to sign in/);
    expect(container).toMatchSnapshot();
  });

  it('should associate the password field with the form-level error via aria-describedby', async () => {
    const { container, findByText } = await setup({ mockResponse });

    await findByText(/Unable to sign in/);

    const passwordInput = container.querySelector<HTMLInputElement>('input[type="password"]');
    expect(passwordInput).not.toBeNull();

    const describedByIds = (passwordInput?.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .filter(Boolean);
    expect(describedByIds).not.toHaveLength(0);

    // The referenced element must exist and resolve to the error text alone, so that a screen
    // reader returning to the field announces the outstanding error.
    const describedByText = describedByIds
      .map((id) => container.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ');
    expect(describedByText).toContain('Unable to sign in');
  });

  it('should not mark the password field invalid when the error is form-level', async () => {
    // The server returns a generic message and does not attribute the failure to a field, so
    // neither does the widget. aria-invalid asserts the entered value failed validation.
    const { container, findByText } = await setup({ mockResponse });

    await findByText(/Unable to sign in/);

    const passwordInput = container.querySelector<HTMLInputElement>('input[type="password"]');
    expect(passwordInput?.getAttribute('aria-invalid')).toBe('false');
    expect(passwordInput?.hasAttribute('aria-errormessage')).toBe(false);
  });

  it('should announce the error through a live region', async () => {
    const { container, findByText } = await setup({ mockResponse });

    await findByText(/Unable to sign in/);

    const alert = container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Unable to sign in');
  });
});

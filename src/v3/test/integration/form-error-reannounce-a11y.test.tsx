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

import { waitFor } from '@testing-library/preact';
import { setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';

describe('Form error re-announcement for screen readers', () => {
  it('should re-create the error alert DOM element on repeated empty form submissions', async () => {
    const {
      user,
      findByRole,
      findByText,
      findByLabelText,
    } = await setup({ mockResponse });

    await findByLabelText(/Username/) as HTMLInputElement;
    const submitButton = await findByText('Sign in', { selector: 'button' });

    // First submission with empty fields — error alert appears
    await user.click(submitButton);
    const firstAlert = await findByRole('alert');
    expect(firstAlert).toBeInTheDocument();
    expect(firstAlert.textContent).toContain('We found some errors.');

    // Second submission with same empty fields — alert must be a NEW DOM node
    // so that screen readers (VoiceOver, NVDA, JAWS) re-announce it
    await user.click(submitButton);
    const secondAlert = await findByRole('alert');
    expect(secondAlert).toBeInTheDocument();
    expect(secondAlert.textContent).toContain('We found some errors.');

    // The key assertion: the alert element must be a brand-new DOM node,
    // not the same one reused from the first submission.
    // A new DOM node with role="alert" forces screen readers to re-announce.
    expect(secondAlert).not.toBe(firstAlert);
  });

  it('should re-create the error alert on a third consecutive submission as well', async () => {
    const {
      user,
      findByRole,
      findByText,
      findByLabelText,
    } = await setup({ mockResponse });

    await findByLabelText(/Username/) as HTMLInputElement;
    const submitButton = await findByText('Sign in', { selector: 'button' });

    // Submit three times consecutively with empty fields
    await user.click(submitButton);
    const firstAlert = await findByRole('alert');

    await user.click(submitButton);
    const secondAlert = await findByRole('alert');

    await user.click(submitButton);
    const thirdAlert = await findByRole('alert');

    // All three alerts should be distinct DOM nodes
    expect(secondAlert).not.toBe(firstAlert);
    expect(thirdAlert).not.toBe(secondAlert);
    expect(thirdAlert).not.toBe(firstAlert);
  });

  it('should still clear the error alert when validation passes after a failed submission', async () => {
    const {
      authClient,
      user,
      findByRole,
      findByText,
      findByLabelText,
      queryByRole,
    } = await setup({ mockResponse });

    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
    const passwordEl = await findByLabelText('Password') as HTMLInputElement;
    const submitButton = await findByText('Sign in', { selector: 'button' });

    // Submit empty form — error alert appears
    await user.click(submitButton);
    await findByRole('alert');

    // Fill in both fields and submit — error should clear
    await user.type(usernameEl, 'testuser@okta.com');
    await user.type(passwordEl, 'fake-password');
    await user.click(submitButton);

    await waitFor(() => {
      expect(queryByRole('alert')).not.toBeInTheDocument();
      expect(authClient.options.httpRequestClient).toHaveBeenCalled();
    });
  });
});

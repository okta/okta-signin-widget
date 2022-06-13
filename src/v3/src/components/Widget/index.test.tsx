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

/* eslint-disable react/jsx-props-no-spreading */
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // TODO: Move fetch polyfill to common jest setup file

import { OktaAuth } from '@okta/okta-auth-js';
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/preact';
import { h } from 'preact';
import { WidgetOptions } from 'src/types';

import { getServer } from '../../mocks/server';
import { Widget } from './index';

// TODO: Move this mswjs setup into common jest setup file if needed
// Establish API mocking before all tests.
const server = getServer('auth-with-email-mfa');

beforeAll(() => {
  server.listen();
  jest.mock('../../lib/okta-i18n', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
  }));
});
// Reset any request handlers that we may add during the tests, so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

// TODO: delete after jest migration done
describe('Widget', () => {
  let props: WidgetOptions;

  beforeEach(() => {
    props = {
      authClient: new OktaAuth({
        clientId: 'dummy_client_id',
        issuer: 'https://oie-123456.oktapreview.com/oauth2/default',
        redirectUri: 'http://localhost:3000/login/callback',
        scopes: ['openid', 'profile', 'email'],
        pkce: false,
      }),
    };
  });

  it('should show input[type=text] for "Username"', async () => {
    render(<Widget {...props} />);
    const input = await screen.findByLabelText(/Username/);
    expect(input.tagName).toMatch(/^input$/i);
    expect(input.getAttribute('type')).toMatch(/^text$/i);
  });

  it('should show input[type=checkbox] for "Remember Me"', async () => {
    render(<Widget {...props} />);
    const input = await screen.findByLabelText(/Remember this device/);
    expect(input.tagName).toMatch(/^input$/i);
    expect(input.getAttribute('type')).toMatch(/^checkbox$/i);
  });

  it('should show input[type=password] for "Password"', async () => {
    render(<Widget {...props} />);
    const input = await screen.findByLabelText(/Password/);
    expect(input.tagName).toMatch(/^input$/i);
    expect(input.getAttribute('type')).toMatch(/^password/i);
  });

  it('should not show error message for input[type=password] if it was unchanged', async () => {
    const { findByLabelText, queryByText } = render(<Widget {...props} />);
    const input = await findByLabelText(/Password/);

    expect(input).toHaveValue('');
    expect(queryByText(/is a required property/)).toBeNull();
  });

  // TODO: need to figure out how to trigger the change and subsequent error to display
  it.skip('should show error message for input if it does not meet requirements', async () => {
    render(<Widget {...props} />);

    const input = await screen.findByLabelText('Password');
    fireEvent.change(input, { value: 'a' });
    fireEvent.change(input, { value: '' });
    expect(screen.getByText(/shorter than 1 characters/)).toBeInTheDocument();
  });

  it.skip('should show phone authentication input', async () => {
    render(<Widget {...props} />);
    const input = await screen.findByLabelText(/phoneNumber/);
    expect(input.tagName).toMatch(/^input$/i);
    expect(input.getAttribute('type')).toMatch(/^tel/i);
    expect(input.getAttribute('name')).toMatch(/^phoneNumber/i);
  });

  it.skip('should show select country list', async () => {
    render(<Widget {...props} />);
    const select = await screen.findByLabelText(/country/);
    expect(select.tagName).toMatch(/^select$/i);
    expect(select.firstElementChild?.tagName).toMatch(/^option/i);
    expect(select.firstElementChild?.getAttribute('value')).toMatch(/^AF/i);
  });

  it.skip('should show input[inputmode=number] for "VerificationCode"', async () => {
    render(<Widget {...props} />);
    const input = await screen.findByLabelText(/Enter code/);
    expect(input.tagName).toMatch(/^input$/i);
    expect(input.getAttribute('inputmode')).toMatch(/^number/i);
  });
});

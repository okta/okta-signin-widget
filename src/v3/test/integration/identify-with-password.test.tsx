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

import '@testing-library/jest-dom';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/preact';
import { h } from 'preact';
import { OktaAuth } from '@okta/okta-auth-js';
import { Widget } from '../../src/components/Widget';
import { updateDynamicAttribute } from './util';

// import identifyWithPassword from '../../mocks/data/idp/idx/identify-with-password.json';
// This only works with new jsonTransformer
describe.skip('identify-with-password', () => {
  let authClient: OktaAuth;

  beforeAll(() => {
    // authClient = createAuthClient(identifyWithPassword);
  });

  it('renders form', async () => {
    const { container } = render(<Widget authClient={authClient} />);
    await screen.findByLabelText(/Username/);

    // NOTE: should some of these attributes be static from odyssey side?
    updateDynamicAttribute(container, ['id', 'for', 'aria-describedby', 'aria-labelledby']);

    expect(container).toMatchSnapshot();
  });

  // TODO: revisit to enable submission payload testing
  // Issue: with fireEvent.input, the event value can reach to component level onChange handler
  // but data is lost after jsonforms processing
  it.skip('sends correct payload', async () => {
    jest.spyOn(authClient.idx, 'proceed');
    render(<Widget authClient={authClient} />);

    await screen.findByLabelText(/Username/);

    const usernameEl = await screen.findByTestId('#/properties/identifier');
    const passwordEl = await screen.findByTestId('#/properties/credentials.passcode');
    const submitButton = await screen.findByTestId('identify.submit');

    fireEvent.input(usernameEl, { target: { value: 'testuser@okta.com' } });
    fireEvent.input(passwordEl, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authClient.options.httpRequestClient).toHaveBeenCalledTimes(3);
      expect(authClient.options.httpRequestClient).toHaveBeenNthCalledWith(3,
        'POST',
        'http://localhost:3000/idp/idx/identify',
        {
          // TODO: dfs mock response to update stateHandle field before serve
          data: '{"identifier":"testuser@okta.com","credentials":{"passcode":"password"},"stateHandle":"fake-stateHandle"}',
          headers: {
            Accept: 'application/vnd.okta.v1+json',
            'Content-Type': 'application/json',
            'X-Okta-User-Agent-Extended': 'okta-auth-js/6.5.1',
          },

          withCredentials: true,
        });
    });
  });
});

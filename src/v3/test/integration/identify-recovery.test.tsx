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

import mockResponse from '../../src/mocks/response/idp/idx/recover/default.json';

describe('identify-recovery', () => {
  it('renders form', async () => {
    const { container, findByLabelText } = await setup({ mockResponse });
    await findByLabelText(/Email or Username/);
    expect(container).toMatchSnapshot();
  });

  it('fails client validation when missing identifier', async () => {
    const {
      user,
      findByLabelText,
      findByText,
      findAllByRole,
    } = await setup({ mockResponse });

    await user.click(await findByText('Next', { selector: 'button' }));
    const [globalError] = await findAllByRole('alert');
    expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
    const identifierEl = await findByLabelText('Email or Username') as HTMLInputElement;
    expect(identifierEl).toHaveErrorMessage(/This field cannot be left blank$/);
  });

  it('sends correct payload', async () => {
    const {
      authClient,
      user,
      findByLabelText,
      findByText,
    } = await setup({ mockResponse });

    const titleElement = await findByText('Reset your password');
    await waitFor(() => expect(titleElement).toHaveFocus());
    const usernameEl = await findByLabelText('Email or Username') as HTMLInputElement;
    await user.type(usernameEl, 'testuser@okta.com');
    await user.click(await findByText('Next', { selector: 'button' }));

    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/identify', { identifier: 'testuser@okta.com' }),
    );
  });
});

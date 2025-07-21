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

import selectAuthenticatorListWithPIV from '../../src/mocks/response/idp/idx/authenticator-select-piv.json';
import pivVerifyResponse from '../../src/mocks/response/idp/idx/authenticator-piv-verify.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('flow-verify-with-piv-as-authenticator', () => {
  it('should render select authenticator page with PIV as authenticator and clicking it will render PIV verify view', async () => {
    const {
      authClient,
      container,
      user,
      findByRole,
      findByText,
      findByTestId,
    } = await setup({
      mockResponses: {
        '/introspect': {
          data: selectAuthenticatorListWithPIV,
          status: 200,
        },
        '/idp/idx/challenge': {
          data: pivVerifyResponse,
          status: 200,
        },
      },
    });

    const selectAuthenticatorHeading = await findByRole('heading', { level: 1 });

    expect(selectAuthenticatorHeading.textContent).toBe('Verify it\'s you with a security method');

    const pivAuthenticatorButton = await findByTestId('smart_card_idp');
    await user.click(pivAuthenticatorButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
        authenticator: { id: 'aut7rcjloeQUmFInC1d7' },
      }),
    );

    await findByText('PIV / CAC card');
    const pivViewHeading = await findByRole('heading', { level: 1 });
    expect(pivViewHeading.textContent).toBe('PIV / CAC card');
    expect(container).toMatchSnapshot();
  });
});

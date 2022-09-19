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

import { createAuthJsPayloadArgs, setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/authenticator-verification-select-authenticator.json';

describe('authenticator-verification-select-authenticator', () => {
  it('renders form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Select from the following options/);
    expect(container).toMatchSnapshot();
  });

  describe('send correct payload', () => {
    it('when select google authenticator', async () => {
      const {
        authClient,
        user,
        findByTestId,
      } = await setup({ mockResponse });

      const authenticatorButton = await findByTestId('google_otp');
      await user.click(authenticatorButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
          authenticator: { id: 'aut11ceMaP0B0EzMI0g4' },
        }),
      );
    });
  });
});

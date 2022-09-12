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

import mockResponse from '../../src/mocks/response/idp/idx/authenticator-enroll-select-authenticator.json';

describe('authenticator-enroll-select-authenticator', () => {
  it('renders form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Set up security methods/);
    await findByText(/Set up required/);
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
        ...createAuthJsPayloadArgs('POST', 'idp/idx/credential/enroll', {
          authenticator: { id: 'aut11ceMaP0B0EzMI0g4' },
        }),
      );
    });
  });

  // TODO: Additional tests and flows can be added when testing monolith scenarios
  /*
    * Scenarios where the stateToken is provided as a prop to the Widget
    * In these cases, the stateHandle should be passed to auth-js and should not throw an exception
    * If this exception is thrown "Unable to proceed: saved transaction could not be loaded"
    * it is because either SIW isnt providing the stateHandle or auth-js somehow lost the
    * provided stateHandled in translation.
    */
  describe('When StateToken is provided to widget', () => {
    it('should send correct payload when clicking cancel button', async () => {
      const {
        authClient,
        user,
        findByTestId,
      } = await setup(
        {
          mockResponse,
          widgetOptions: { stateToken: '1234567890abcdefghij' },
        },
      );

      const cancelBtn = await findByTestId('cancel');
      await user.click(cancelBtn);

      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/cancel'),
      );
    });
  });
});

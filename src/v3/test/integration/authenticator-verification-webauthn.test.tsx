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

import mockResponseWithRequiredUserVerification from '@okta/mocks/data/idp/idx/authenticator-verification-webauthn.json';
import { setup, getMockCredentialsResponse } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/challenge/unlock-account-email-verify-webauthn.json';

describe('authenticator-verification-webauthn', () => {
  it('renders form - webauthn supported', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      {
        credentials: {
          create: jest.fn(),
          get: jest.fn().mockResolvedValue(getMockCredentialsResponse()),
        },
        userAgent: '',
      } as unknown as Navigator,
    );
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with Security Key or Biometric Authenticator/);
    await findByText(/You will be prompted to use a security key or biometric verification/);
    expect(container).toMatchSnapshot();
  });

  it('should render form with required user verification in safari browser', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      {
        credentials: {
          create: jest.fn(),
          get: jest.fn().mockResolvedValue(getMockCredentialsResponse()),
        },
        userAgent: 'safari',
      } as unknown as Navigator,
    );
    const { container, findByText } = await setup({
      mockResponse: mockResponseWithRequiredUserVerification,
    });
    await findByText(/Verify with Security Key or Biometric Authenticator/);
    await findByText(/You will be prompted to use a security key or biometric verification/);
    expect(container).toMatchSnapshot();
  });

  it('renders form - webauthn not supported', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      {
        credentials: undefined,
        userAgent: '',
      } as unknown as Navigator,
    );
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with Security Key or Biometric Authenticator/);
    await findByText(/Security key or biometric authenticator is not supported on this browser. Contact your admin for assistance./);
    expect(container).toMatchSnapshot();
  });
});

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

import { setup, getMockCredentialsResponse, createAuthJsPayloadArgs } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/webauthn-enroll-mfa.json';
import mockResponseWithRequiredUserVerification from '../../src/mocks/response/idp/idx/authenticator-enroll-webauthn-userverification-required.json';

describe('webauthn-enroll', () => {
  let mockCredentialsContainer: CredentialsContainer | undefined;

  beforeEach(() => {
    mockCredentialsContainer = {
      create: jest.fn().mockResolvedValueOnce(
        getMockCredentialsResponse(),
      ),
      get: jest.fn().mockResolvedValueOnce(
        getMockCredentialsResponse(),
      ),
      preventSilentAccess: jest.fn(),
      store: jest.fn(),
    };
  });

  it('should render form', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      { credentials: mockCredentialsContainer, userAgent: '' } as unknown as Navigator,
    );
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Set up security key or biometric authenticator/);
    expect(container).toMatchSnapshot();
  });

  it('should render form with user verification and edge browser callouts', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      { credentials: mockCredentialsContainer, userAgent: 'edge' } as unknown as Navigator,
    );
    const { container, findByText } = await setup({
      mockResponse: mockResponseWithRequiredUserVerification,
    });
    await findByText(/Set up security key or biometric authenticator/);
    expect(container).toMatchSnapshot();
  });

  it('should render form when Credentials API is not available', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      { credentials: undefined, userAgent: '' } as unknown as Navigator,
    );

    const { container, findByText } = await setup({ mockResponse });

    await findByText(/Set up security key or biometric authenticator/);
    await findByText(/Security key or biometric authenticator is not supported on this browser. Contact your admin for assistance./);

    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      { credentials: mockCredentialsContainer, userAgent: '' } as unknown as Navigator,
    );

    const {
      authClient,
      user,
      findByText,
      findByTestId,
    } = await setup({ mockResponse });

    await findByText(/Set up security key or biometric authenticator/);
    await findByText(/You will be prompted to register a security key/);

    const submitButton = await findByTestId('button');

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: {
          clientData: 'AAAAAAAAAAAAAA==',
          attestation: 'AAAAAAAAAAAAAA==',
        },
      }),
    );
  });
});

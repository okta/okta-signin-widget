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

import {
  ChallengeData,
  IdxAuthenticator,
  OktaAuth,
  RawIdxResponse,
  WebauthnAPI,
  WebauthnVerificationValues,
} from '@okta/okta-auth-js';
import { getMockCreateCredentialsResponse, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import { webAuthNAuthenticationHandler, webAuthNEnrollmentHandler } from '.';

describe('WebAuthN Util Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let mockedWebauthn: WebauthnAPI;
  let mockCredentialsContainer: CredentialsContainer;

  beforeEach(() => {
    mockCredentialsContainer = {
      create: jest.fn().mockResolvedValueOnce(
        getMockCreateCredentialsResponse(),
      ),
      get: jest.fn().mockResolvedValueOnce(
        getMockCreateCredentialsResponse(),
      ),
      preventSilentAccess: jest.fn(),
      store: jest.fn(),
    };
    const navigatorCredentials = jest.spyOn(global, 'navigator', 'get');
    navigatorCredentials.mockReturnValue(
      { credentials: mockCredentialsContainer } as unknown as Navigator,
    );
    mockedWebauthn = {
      buildCredentialCreationOptions: jest.fn(),
      buildCredentialRequestOptions: jest.fn(),
      getAssertion: jest.fn().mockImplementationOnce(
        () => ({
          id: '123',
          clientData: 'abc',
          authenticatorData: 'def',
          signatureData: 'ghi',
        } as WebauthnVerificationValues),
      ),
      getAttestation: jest.fn(),
    };
    OktaAuth.webauthn = mockedWebauthn;
  });

  // afterAll(() => {
  //   jest.restoreAllMocks();
  // });

  it('should create clientData & attestation parameters when enrolling with webauthn', async () => {
    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          contextualData: { activationData: 'abc123' },
        } as unknown as IdxAuthenticator,
      },
    };
    transaction.rawIdxState = {
      ...transaction.rawIdxState,
      authenticatorEnrollments: { value: [{ credentialId: '123456' }] },
    } as RawIdxResponse;
    const { credentials } = await webAuthNEnrollmentHandler(transaction);

    expect(credentials.clientData).not.toBeUndefined();
    expect(credentials.attestation).not.toBeUndefined();
    expect(mockedWebauthn.buildCredentialCreationOptions).toHaveBeenCalled();
    expect(mockCredentialsContainer.create).toHaveBeenCalled();
  });

  it('should throw an error when browser credentials prompt is interrupted while enrolling with webauthn', async () => {
    mockCredentialsContainer.create = jest.fn().mockImplementationOnce(
      () => Promise.reject(new Error('NotAllowed')),
    );

    await expect(webAuthNEnrollmentHandler(transaction)).rejects.toThrow('NotAllowed');
  });

  it('should create clientData, authenticatorData, & signatureData parameters when authenticating with webauthn',
    async () => {
      transaction.nextStep = {
        name: 'mock-step',
        relatesTo: {
          value: {
            contextualData: {
              challengeData: {} as ChallengeData,
            },
          } as IdxAuthenticator,
        },
      };
      transaction.rawIdxState = {
        ...transaction.rawIdxState,
        authenticatorEnrollments: { value: [{ credentialId: '123456' }] },
      } as RawIdxResponse;
      const { credentials } = await webAuthNAuthenticationHandler(transaction);

      expect(credentials.clientData).toBe('abc');
      expect(credentials.authenticatorData).toBe('def');
      expect(credentials.signatureData).toBe('ghi');
      expect(mockedWebauthn.buildCredentialRequestOptions).toHaveBeenCalled();
      expect(mockedWebauthn.getAssertion).toHaveBeenCalled();
      expect(mockCredentialsContainer.get).toHaveBeenCalled();
    });

  it('should throw an error when browser credentials prompt is interrupted while authenticating with webauthn', async () => {
    mockCredentialsContainer.get = jest.fn().mockImplementationOnce(
      () => Promise.reject(new Error('NotAllowed')),
    );

    await expect(webAuthNAuthenticationHandler(transaction)).rejects.toThrow('NotAllowed');
  });
});

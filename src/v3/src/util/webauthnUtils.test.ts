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
  NextStep,
  OktaAuth,
  WebauthnAPI,
  WebauthnVerificationValues,
} from '@okta/okta-auth-js';

import { webAuthNAuthenticationHandler, webAuthNEnrollmentHandler } from '.';

const getMockCreateCredentialsResponse = (): PublicKeyCredential => (
  {
    id: 'test',
    type: 'test',
    rawId: new ArrayBuffer(10),
    getClientExtensionResults: jest.fn(),
    response: {
      clientDataJSON: new ArrayBuffer(10),
      attestationObject: new ArrayBuffer(10),
    } as AuthenticatorAttestationResponse,
  } as PublicKeyCredential
);

const getMockNextStep = (): NextStep => (
  {
    name: 'test',
    authenticator: {
      displayName: '',
      id: '',
      key: '',
      type: '',
      methods: [],
      contextualData: {
        activationData: {
          challenge: '',
          pubKeyCredParams: [],
          rp: { name: '' },
          user: {
            id: '',
            name: '',
            displayName: '',
          },
        },
        challengeData: {
          challenge: '',
          userVerification: '',
        },
      },
    },
    authenticatorEnrollments: [{
      displayName: '',
      id: '',
      key: '',
      methods: [],
      type: '',
    }],
  }
);

describe('WebAuthN Util Tests', () => {
  let mockedWebauthn: WebauthnAPI;
  let mockCredentialsContainer: CredentialsContainer;
  let mockNextStep: NextStep;

  beforeEach(() => {
    mockCredentialsContainer = {
      create: jest.fn().mockImplementationOnce(
        () => Promise.resolve(
          getMockCreateCredentialsResponse(),
        ),
      ),
      get: jest.fn().mockImplementationOnce(
        () => Promise.resolve(
          getMockCreateCredentialsResponse(),
        ),
      ),
      preventSilentAccess: jest.fn(),
      store: jest.fn(),
    };
    Object.defineProperty(global.navigator, 'credentials', {
      value: mockCredentialsContainer,
      configurable: true,
    });
    mockNextStep = getMockNextStep();
    mockedWebauthn = {
      buildCredentialCreationOptions: jest.fn(),
      buildCredentialRequestOptions: jest.fn(),
      getAssertion: jest.fn().mockImplementationOnce(
        () => ({
          clientData: 'abc',
          authenticatorData: 'def',
          signatureData: 'ghi',
        } as WebauthnVerificationValues),
      ),
      getAttestation: jest.fn(),
    };
    OktaAuth.webauthn = mockedWebauthn;
  });

  it('should create clientData & attestation parameters when enrolling with webauthn', async () => {
    const { clientData, attestation } = await webAuthNEnrollmentHandler(mockNextStep);

    expect(clientData).toBeTruthy();
    expect(attestation).toBeTruthy();
    expect(mockedWebauthn.buildCredentialCreationOptions).toHaveBeenCalled();
    expect(mockCredentialsContainer.create).toHaveBeenCalled();
  });

  it('should throw an error when browser credentials prompt is interrupted while enrolling with webauthn', async () => {
    mockCredentialsContainer.create = jest.fn().mockImplementationOnce(
      () => Promise.reject(new Error('NotAllowed')),
    );

    await expect(webAuthNEnrollmentHandler(mockNextStep)).rejects.toThrow('NotAllowed');
  });

  it('should create clientData, authenticatorData, & signatureData parameters when authenticating with webauthn',
    async () => {
      const {
        clientData,
        authenticatorData,
        signatureData,
      } = await webAuthNAuthenticationHandler(mockNextStep);

      expect(clientData).toBe('abc');
      expect(authenticatorData).toBe('def');
      expect(signatureData).toBe('ghi');
      expect(mockedWebauthn.buildCredentialRequestOptions).toHaveBeenCalled();
      expect(mockedWebauthn.getAssertion).toHaveBeenCalled();
      expect(mockCredentialsContainer.get).toHaveBeenCalled();
    });

  it('should throw an error when browser credentials prompt is interrupted while authenticating with webauthn', async () => {
    mockCredentialsContainer.get = jest.fn().mockImplementationOnce(
      () => Promise.reject(new Error('NotAllowed')),
    );

    await expect(webAuthNAuthenticationHandler(mockNextStep)).rejects.toThrow('NotAllowed');
  });
});

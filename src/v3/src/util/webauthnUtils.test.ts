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

import {
  isCredentialIdAccepted,
  isRelyingPartyIdMismatchError,
  webAuthNAuthenticationHandler,
  webAuthNEnrollmentHandler,
} from '.';

jest.mock('./locUtil', () => ({
  loc: jest.fn().mockImplementation((key: string, _bundle: string, params?: unknown[]) => {
    if (params?.length) {
      return `${key}:${params.join(',')}`;
    }
    return key;
  }),
}));

describe('isRelyingPartyIdMismatchError', () => {
  it('should return true for a DOMException with name SecurityError and code 18', () => {
    const error = new DOMException('RP ID mismatch', 'SecurityError');
    expect(isRelyingPartyIdMismatchError(error)).toBe(true);
  });

  it('should return false for a regular Error', () => {
    expect(isRelyingPartyIdMismatchError(new Error('SecurityError'))).toBe(false);
  });

  it('should return false for a DOMException with a different name', () => {
    const error = new DOMException('not allowed', 'NotAllowedError');
    expect(isRelyingPartyIdMismatchError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isRelyingPartyIdMismatchError(null)).toBe(false);
    expect(isRelyingPartyIdMismatchError(undefined)).toBe(false);
    expect(isRelyingPartyIdMismatchError('string')).toBe(false);
  });
});

const credentialsInput = (fieldNames: string[]) => ({
  name: 'credentials',
  form: { value: fieldNames.map((name) => ({ name })) },
});

describe('isCredentialIdAccepted', () => {
  it('should return true when the step credentials form declares credentialId', () => {
    const transaction = getStubTransactionWithNextStep();
    transaction.neededToProceed = [{
      name: 'challenge-authenticator',
      value: [credentialsInput(['clientData', 'credentialId'])],
    }] as unknown as typeof transaction.neededToProceed;

    expect(isCredentialIdAccepted(transaction, 'challenge-authenticator')).toBe(true);
  });

  it('should return false when the step credentials form does not declare credentialId', () => {
    const transaction = getStubTransactionWithNextStep();
    transaction.neededToProceed = [{
      name: 'challenge-authenticator',
      value: [credentialsInput(['clientData', 'userHandle'])],
    }] as unknown as typeof transaction.neededToProceed;

    expect(isCredentialIdAccepted(transaction, 'challenge-authenticator')).toBe(false);
  });

  it('should return false when the step is not present', () => {
    const transaction = getStubTransactionWithNextStep();
    transaction.neededToProceed = [{
      name: 'identify',
      value: [credentialsInput(['credentialId'])],
    }] as unknown as typeof transaction.neededToProceed;

    expect(isCredentialIdAccepted(transaction, 'challenge-authenticator')).toBe(false);
  });
});

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
      getAttestation: jest.fn().mockReturnValue({
        id: 'test-id',
        clientData: 'mock-client-data',
        attestation: 'mock-attestation',
      }),
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

    expect(credentials.clientData).toBe('mock-client-data');
    expect(credentials.attestation).toBe('mock-attestation');
    expect(credentials.transports).toBeUndefined();
    expect(mockedWebauthn.buildCredentialCreationOptions).toHaveBeenCalled();
    expect(mockedWebauthn.getAttestation).toHaveBeenCalled();
    expect(mockCredentialsContainer.create).toHaveBeenCalled();
  });

  it('should return transports when getAttestation includes them', async () => {
    mockedWebauthn.getAttestation = jest.fn().mockReturnValue({
      id: 'test-id',
      clientData: 'mock-client-data',
      attestation: 'mock-attestation',
      transports: '["usb","nfc"]',
    });

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

    expect(credentials.transports).toEqual('["usb","nfc"]');
  });

  it('should throw an error when browser credentials prompt is interrupted while enrolling with webauthn', async () => {
    mockCredentialsContainer.create = jest.fn().mockImplementationOnce(
      () => Promise.reject(new Error('NotAllowed')),
    );

    await expect(webAuthNEnrollmentHandler(transaction)).rejects.toThrow('NotAllowed');
  });

  it('should throw localized SecurityError when credentials.create rejects with RP ID mismatch', async () => {
    mockCredentialsContainer.create = jest.fn().mockRejectedValueOnce(
      new DOMException('RP ID mismatch', 'SecurityError'),
    );

    await expect(webAuthNEnrollmentHandler(transaction))
      .rejects.toThrow('signin.passkeys.error.SecurityError');
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

  it('should omit id from the verification payload when credentialId is not declared', async () => {
    transaction.nextStep = {
      name: 'challenge-authenticator',
      relatesTo: {
        value: {
          contextualData: { challengeData: {} as ChallengeData },
        } as IdxAuthenticator,
      },
    };
    transaction.neededToProceed = [{
      name: 'challenge-authenticator',
      value: [credentialsInput(['clientData', 'authenticatorData', 'signatureData'])],
    }] as unknown as typeof transaction.neededToProceed;
    transaction.rawIdxState = {
      ...transaction.rawIdxState,
      authenticatorEnrollments: { value: [{ credentialId: '123456' }] },
    } as RawIdxResponse;
    const { credentials } = await webAuthNAuthenticationHandler(transaction);

    expect(credentials).toEqual({
      clientData: 'abc',
      authenticatorData: 'def',
      signatureData: 'ghi',
    });
  });

  it('should send id as credentialId when the challenge form declares credentialId', async () => {
    transaction.nextStep = {
      name: 'challenge-authenticator',
      relatesTo: {
        value: {
          contextualData: { challengeData: {} as ChallengeData },
        } as IdxAuthenticator,
      },
    };
    transaction.neededToProceed = [{
      name: 'challenge-authenticator',
      value: [credentialsInput(['clientData', 'authenticatorData', 'signatureData', 'credentialId'])],
    }] as unknown as typeof transaction.neededToProceed;
    transaction.rawIdxState = {
      ...transaction.rawIdxState,
      authenticatorEnrollments: { value: [{ credentialId: '123456' }] },
    } as RawIdxResponse;
    const { credentials } = await webAuthNAuthenticationHandler(transaction);

    expect(credentials).toEqual({
      clientData: 'abc',
      authenticatorData: 'def',
      signatureData: 'ghi',
      credentialId: '123',
    });
  });

  it('should throw an error when browser credentials prompt is interrupted while authenticating with webauthn', async () => {
    mockCredentialsContainer.get = jest.fn().mockImplementationOnce(
      () => Promise.reject(new Error('NotAllowed')),
    );

    await expect(webAuthNAuthenticationHandler(transaction)).rejects.toThrow('NotAllowed');
  });

  it('should throw localized rpIdMismatch error with rpId when credentials.get rejects with RP ID mismatch', async () => {
    mockCredentialsContainer.get = jest.fn().mockRejectedValueOnce(
      new DOMException('RP ID mismatch', 'SecurityError'),
    );

    transaction.nextStep = {
      name: 'mock-step',
      relatesTo: {
        value: {
          contextualData: {
            challengeData: { rpId: 'example.okta.com' } as ChallengeData,
          },
        } as IdxAuthenticator,
      },
    };
    transaction.rawIdxState = {
      ...transaction.rawIdxState,
      authenticatorEnrollments: { value: [{ credentialId: '123456' }] },
    } as RawIdxResponse;

    await expect(webAuthNAuthenticationHandler(transaction))
      .rejects.toThrow('signin.passkeys.error.rpIdMismatch:example.okta.com');
  });
});

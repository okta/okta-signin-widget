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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpRequestClient, OktaAuth } from '@okta/okta-auth-js';

export const updateStateHandleInMock = (res?: Record<string, unknown>) => {
  if (!res) {
    return;
  }
  Object.entries(res).forEach(([key, value]) => {
    if (key === 'stateHandle') {
      res[key] = 'fake-stateHandle';
      return;
    }
    if (key === 'name' && value === 'stateHandle') {
      res.value = 'fake-stateHandle';
    }
    if (Array.isArray(value)) {
      value.forEach(updateStateHandleInMock);
      return;
    }
    if (typeof value === 'object') {
      updateStateHandleInMock(value as Record<string, unknown>);
    }
  });
};

export type CreateAuthClientOptions = {
  mocksPaused?: boolean;
  mockResponse?: Record<string, unknown>;
  mockResponses?: Record<string, Record<string, unknown>>;
  mockRequestClient?: HttpRequestClient;
};

/**
 * Utility to create an auth client to be used in tests.
 * Set `mocksPaused` to have the initial state of the auth client with mocks paused.
 *
 * The returned `pauseMocks` and `resumeMocks` functions can be used to explicitly
 * control when network requests are paused and resumed. This makes it possible to
 * reliably assert during loading states in tests.
 */
export const createAuthClient = (options: CreateAuthClientOptions): {
  authClient: OktaAuth;
  pauseMocks: () => void;
  resumeMocks: () => void;
} => {
  const {
    mocksPaused = false,
    mockResponse,
    mockResponses,
    mockRequestClient,
  } = options;
  let resolveMockResponse: () => void = () => {};
  let responsePrecondition: Promise<void> = Promise.resolve();

  const pauseMocks = () => {
    responsePrecondition = new Promise((resolve) => {
      resolveMockResponse = resolve;
    });
  };
  const resumeMocks = () => {
    resolveMockResponse();
    responsePrecondition = Promise.resolve();
    resolveMockResponse = () => {};
  };

  if (mocksPaused) {
    pauseMocks();
  }

  const authClient = new OktaAuth({
    clientId: 'dummy_client_id',
    issuer: 'http://localhost:3000/oauth2/default',
    redirectUri: 'http://localhost:3000/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: false,
    idx: {
      useGenericRemediator: true,
    },
    httpRequestClient: mockRequestClient ?? jest.fn().mockImplementation(async (_, url) => {
      // pause mocks if `pauseMocks` was called until `resumeMocks` is called
      await responsePrecondition;
      // match request against mockResponses first
      if (mockResponses) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, value] of Object.entries(mockResponses)) {
          const { data, status } = value;
          if (url.endsWith(key)) {
            updateStateHandleInMock(data as Record<string, unknown>);
            if (status !== 200) {
              // eslint-disable-next-line prefer-promise-reject-errors
              return Promise.reject({
                responseText: JSON.stringify(data),
                responseJSON: data,
                status,
                headers: { 'content-type': 'application/ion+json; okta-version=1.0.0' },
              });
            }
            return Promise.resolve({
              responseText: JSON.stringify(data),
              headers: { 'content-type': 'application/ion+json; okta-version=1.0.0' },
            });
          }
        }
      }

      // mock all potential request with mockReponse
      updateStateHandleInMock(mockResponse);

      if (mockResponse?.error) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject({
          responseText: JSON.stringify(mockResponse),
        });
      }

      if (url.endsWith('/interact')) {
        return Promise.resolve({
          responseText: JSON.stringify({
            interaction_handle: 'fake-interactionhandle',
          }),
        });
      }

      if (url.endsWith('/introspect')) {
        return Promise.resolve({
          responseText: JSON.stringify(mockResponse),
        });
      }

      if (mockResponse?.cancel) {
        if (url === (mockResponse as any).cancel.href) {
          return Promise.resolve({
            responseText: JSON.stringify(mockResponse),
          });
        }
      }

      if (mockResponse?.remediation) {
        // eslint-disable-next-line no-restricted-syntax
        for (const remediation of (mockResponse as any).remediation.value) {
          if (url === remediation.href) {
            return Promise.resolve({
              responseText: JSON.stringify(mockResponse),
            });
          }
        }
      }

      if (mockResponse?.currentAuthenticator) {
        // eslint-disable-next-line no-restricted-syntax
        for (const action of Object.values((mockResponse as any).currentAuthenticator.value)) {
          if (url === (action as any).href) {
            return Promise.resolve({
              responseText: JSON.stringify(mockResponse),
            });
          }
        }
      }

      if (mockResponse?.currentAuthenticatorEnrollment) {
        // eslint-disable-next-line no-restricted-syntax
        for (const action of Object.values(
          (mockResponse as any).currentAuthenticatorEnrollment.value,
        )) {
          if (url === (action as any).href) {
            return Promise.resolve({
              responseText: JSON.stringify(mockResponse),
            });
          }
        }
      }

      // reject unknown request
      return Promise.reject(new Error('Unknown request'));
    }),
  });

  // eslint-disable-next-line no-underscore-dangle
  authClient._oktaUserAgent.getHttpHeader = jest.fn().mockReturnValue({
    'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
  });

  return {
    authClient,
    pauseMocks,
    resumeMocks,
  };
};

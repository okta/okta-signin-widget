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

import { HttpRequestClient, OktaAuth } from '@okta/okta-auth-js';

export type CreateAuthClientOptions = {
  mockResponse?: Record<string, unknown>;
  mockResponses?: Record<string, Record<string, unknown>>;
  mockRequestClient?: HttpRequestClient;
};

const updateStateHandleInMock = (res?: Record<string, unknown>) => {
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

export const createAuthClient = (options: CreateAuthClientOptions): OktaAuth => {
  const {
    mockResponse, mockResponses, mockRequestClient,
  } = options;

  const authClient = new OktaAuth({
    clientId: 'dummy_client_id',
    issuer: 'https://oie-123456.oktapreview.com/oauth2/default',
    redirectUri: 'http://localhost:3000/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: false,
    idx: {
      useGenericRemediator: true,
    },
    httpRequestClient: mockRequestClient ?? jest.fn().mockImplementation((_, url) => {
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
                status,
                headers: {},
              });
            }
            return Promise.resolve({
              responseText: JSON.stringify(data),
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

  return authClient;
};

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

import { OktaAuth } from '@okta/okta-auth-js';

export const createAuthClient = (
  mockResponse: Record<string, unknown>,
): OktaAuth => new OktaAuth({
  clientId: 'dummy_client_id',
  issuer: 'https://oie-123456.oktapreview.com/oauth2/default',
  redirectUri: 'http://localhost:3000/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: false,
  idx: {
    useGenericRemediator: true,
  },
  httpRequestClient: jest.fn().mockImplementation((_, url) => {
    if (url.endsWith('/interact')) {
      return Promise.resolve({
        responseText: JSON.stringify({
          interaction_handle: 'XW54hgROw9SbFCGdREsFBU5ytY6-imGdwtywkY-eJ14',
        }),
      });
    }

    if (url.endsWith('/introspect')) {
      return Promise.resolve({
        responseText: JSON.stringify(mockResponse),
      });
    }

    // mock response of the form submission request, so auth-js can proceed with a valid response
    const targetURL = (mockResponse as any).remediation.value[0].href;
    if (url === targetURL) {
      return Promise.resolve({
        responseText: JSON.stringify(mockResponse),
      });
    }

    return Promise.reject(new Error('Unknown request'));
  }),
});

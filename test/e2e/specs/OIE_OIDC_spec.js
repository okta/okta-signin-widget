/*!
 * Copyright (c) 2015-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
/* global browser */
const OIEPrimaryAuthPage = require('../page-objects/OIEPrimaryAuthPage'),
    OIDCAppPage = require('../page-objects/OIDCAppPage'),
    util = require('../util/util'),
    Expect = require('../util/Expect');

function setup (options) {
  browser.executeScript('initialize(' + JSON.stringify(options) + ')');
}

const clientIds = ['{{{WIDGET_WEB_CLIENT_ID}}}', '{{{WIDGET_SPA_CLIENT_ID}}}'];

describe('OIE OIDC flows', function () {
  // TODO: Enable after fixing OKTA-244878
  if (process.env.SAUCE_PLATFORM_NAME === 'android') {
    return 0;
  }

  const primaryAuth = new OIEPrimaryAuthPage(),
      oidcApp = new OIDCAppPage();

  beforeEach(function () {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('oidc');
  });

  afterEach(function () {
    // Logout of Okta session
    browser.get('{{{WIDGET_TEST_SERVER}}}/login/signout');
  });

  describe('Okta as IDP', function () {

    clientIds.forEach(clientId => {
      it('can login and exchange a sessionToken for an id_token', function () {
        setup({
          baseUrl: '{{{WIDGET_TEST_SERVER}}}',
          clientId,
          redirectUri: 'http://localhost:3000/done',
          authParams: {
            pkce: false,
            responseType: 'id_token',
            scopes: ['openid', 'email', 'profile', 'address', 'phone']
          }
        });
        Expect.toBeA11yCompliant();
        primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
        expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME}}}');
      });

      // TODO - Enable after https://oktainc.atlassian.net/browse/OKTA-375434
      xit('throws form error if auth client returns with OAuth error', function () {
        setup({
          baseUrl: '{{{WIDGET_TEST_SERVER}}}',
          clientId,
          redirectUri: 'http://localhost:3000/done',
          authParams: {
            pkce: false,
            responseType: 'id_token',
            scopes: ['openid', 'email', 'profile', 'address', 'phone']
          }
        });
        primaryAuth.loginToForm('{{{WIDGET_BASIC_USER_5}}}', '{{{WIDGET_BASIC_PASSWORD_5}}}');
        expect(primaryAuth.getErrorMessage()).toBe('User is not assigned to the client application.');
      });

      it('can login and get a token and id_token', function () {
        setup({
          baseUrl: '{{{WIDGET_TEST_SERVER}}}',
          clientId,
          redirectUri: 'http://localhost:3000/done',
          authParams: {
            pkce: false,
            responseType: ['id_token', 'token'],
            scopes: ['openid', 'email', 'profile', 'address', 'phone']
          },
          idps: [
            {
              'type': 'FACEBOOK',
              'id': '0oa85bk5q6KOPeHCT0h7'
            }
          ]
        });
        Expect.toBeA11yCompliant();
        primaryAuth.loginToForm('{{{WIDGET_BASIC_USER_2}}}', '{{{WIDGET_BASIC_PASSWORD_2}}}');
        expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME_2}}}');
        expect(oidcApp.getAccessTokenType()).toBe('Bearer');
      });
  
    });

    it('logs in and uses the redirect flow for responseType "code"', function () {
      setup({
        baseUrl: '{{{WIDGET_TEST_SERVER}}}',
        clientId: '{{{WIDGET_WEB_CLIENT_ID}}}',
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          pkce: false,
          responseType: 'code',
          scopes: ['openid', 'email', 'profile', 'address', 'phone']
        }
      });
      Expect.toBeA11yCompliant();
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER_4}}}', '{{{WIDGET_BASIC_PASSWORD_4}}}');
      expect(oidcApp.getCodeFromQuery()).not.toBeNull();
    });

    it('PKCE login flow', function () {
      setup({
        baseUrl: '{{{WIDGET_TEST_SERVER}}}',
        clientId: '{{{WIDGET_SPA_CLIENT_ID}}}',
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          pkce: true,
          display: 'page',
          scopes: ['openid', 'email', 'profile', 'address', 'phone']
        }
      });
      Expect.toBeA11yCompliant();
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER_2}}}', '{{{WIDGET_BASIC_PASSWORD_2}}}');
      expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME_2}}}');
      expect(oidcApp.getAccessTokenType()).toBe('Bearer');
    });

    it('PKCE login flow (fragment)', function () {
      setup({
        baseUrl: '{{{WIDGET_TEST_SERVER}}}',
        clientId: '{{{WIDGET_SPA_CLIENT_ID}}}',
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          pkce: true,
          display: 'page',
          responseMode: 'fragment',
          scopes: ['openid', 'email', 'profile', 'address', 'phone']
        }
      });
      Expect.toBeA11yCompliant();
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER_2}}}', '{{{WIDGET_BASIC_PASSWORD_2}}}');
      expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME_2}}}');
      expect(oidcApp.getAccessTokenType()).toBe('Bearer');
    });

  });
});

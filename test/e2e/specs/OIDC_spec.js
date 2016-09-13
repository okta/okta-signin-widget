/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
/*global JSON */
var PrimaryAuthPage = require('../page-objects/PrimaryAuthPage'),
    OIDCAppPage = require('../page-objects/OIDCAppPage'),
    FacebookPage = require('../page-objects/FacebookPage'),
    util = require('../util/util');

function setup(options) {
  browser.executeScript('initialize(' + JSON.stringify(options) + ')');
}

describe('OIDC flows', function() {
  var primaryAuth = new PrimaryAuthPage(),
      oidcApp = new OIDCAppPage(),
      facebook = new FacebookPage();

  beforeEach(function() {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('oidc');
  });

  afterEach(function () {
    // Logout of Okta session
    browser.get('{{{WIDGET_TEST_SERVER}}}/login/signout');
  });

  describe('Okta as IDP', function () {

    it('can login and exchange a sessionToken for an idToken', function() {
      setup({
        baseUrl: '{{{WIDGET_TEST_SERVER}}}',
        clientId: 'rW47c465c1wc3MKzHznu',
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          responseType: 'id_token',
          responseMode: 'okta_post_message',
          scope: ['openid', 'email', 'profile', 'address', 'phone']
        },
        idps: [
          {
            'type': 'FACEBOOK',
            'id': '0oa85bk5q6KOPeHCT0h7'
          }
        ]
      });
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
      expect(oidcApp.getIdTokenUser()).toEqual('Saml Jackson');
    });

    it('can login and get an accessToken and idToken', function () {
      setup({
        baseUrl: '{{{WIDGET_TEST_SERVER}}}',
        clientId: 'rW47c465c1wc3MKzHznu',
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          responseType: ['id_token', 'token'],
          responseMode: 'okta_post_message',
          scope: ['openid', 'email', 'profile', 'address', 'phone']
        },
        idps: [
          {
            'type': 'FACEBOOK',
            'id': '0oa85bk5q6KOPeHCT0h7'
          }
        ]
      });
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER_2}}}', '{{{WIDGET_BASIC_PASSWORD_2}}}');
      expect(oidcApp.getIdTokenUser()).toEqual('Alexander Hamilton');
      expect(oidcApp.getAccessTokenType()).toEqual('Bearer');
    });

  });

  describe('Social IDP', function () {

    afterEach(function () {
      facebook.logout();
    });

    it('can login and get an idToken in the popup flow', function () {
      setup({
        baseUrl: '{{{WIDGET_TEST_SERVER}}}',
        clientId: 'rW47c465c1wc3MKzHznu',
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          responseType: 'id_token',
          scope: ['openid', 'email', 'profile', 'address', 'phone']
        },
        idps: [
          {
            'type': 'FACEBOOK',
            'id': '0oa85bk5q6KOPeHCT0h7'
          }
        ]
      });
      primaryAuth.loginToSocialIdpPopup('facebook', '{{{WIDGET_FB_USER}}}', '{{{WIDGET_FB_PASSWORD}}}');
      expect(oidcApp.getIdTokenUser()).toEqual('Tom Alacddgjegbja Qinson');
    });

    it('can login and get an idToken in the redirect flow', function () {
      setup({
        baseUrl: '{{{WIDGET_TEST_SERVER}}}',
        clientId: 'rW47c465c1wc3MKzHznu',
        redirectUri: 'http://localhost:3000/done',
        authParams: {
          responseType: 'id_token',
          scope: ['openid', 'email', 'profile', 'address', 'phone'],
          display: 'page'
        },
        idps: [
          {
            'type': 'FACEBOOK',
            'id': '0oa85bk5q6KOPeHCT0h7'
          }
        ]
      });
      primaryAuth.loginToSocialIdpRedirect('facebook', '{{{WIDGET_FB_USER_2}}}', '{{{WIDGET_FB_PASSWORD_2}}}');
      expect(oidcApp.getIdTokenUser()).toEqual('Joe Alacchebjdhcf Bharambewitz');
    });

  });

});

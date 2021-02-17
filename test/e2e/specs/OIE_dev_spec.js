/* eslint-disable no-unused-vars */
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
/* global browser, element, by, oktaSignIn */
var OIEPrimaryAuthPage = require('../page-objects/OIEPrimaryAuthPage'),
    OIDCAppPage     = require('../page-objects/OIDCAppPage'),
    util            = require('../util/util');

const clientIds = ['{{{WIDGET_WEB_CLIENT_ID}}}', '{{{WIDGET_SPA_CLIENT_ID}}}'];

describe('OIE Dev Mode flows', function () {

  beforeEach(function () {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('basic-dev');
  });

  clientIds.forEach(clientId => {
    it('can login and return tokens using the showSignInToGetTokens method', function () {
      var options = {
        clientId,
        redirectUri: 'http://localhost:3000/done',
        scopes: ['openid', 'profile']
      };
  
      browser.executeScript(`oktaSignIn.showSignInToGetTokens(${JSON.stringify(options)}).then(addTokensToPage);`);
  
      // Ensure the widget exists
      var el = element(by.css('[id="okta-sign-in"]'));
      expect(el.isDisplayed()).toBe(true);
  
      var primaryAuth = new OIEPrimaryAuthPage(),
          oidcApp = new OIDCAppPage();
  
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
      expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME}}}');
    });
  
    it('can login and receive tokens on a callback using the showSignInAndRedirect method', function () {
      var options = {
        clientId,
        redirectUri: 'http://localhost:3000/done',
        scopes: ['openid', 'profile']
      };
  
      browser.executeScript(`oktaSignIn.showSignInAndRedirect(${JSON.stringify(options)})`);
  
      // Ensure the widget exists
      var el = element(by.css('[id="okta-sign-in"]'));
      expect(el.isDisplayed()).toBe(true);
  
      var primaryAuth = new OIEPrimaryAuthPage(),
          oidcApp = new OIDCAppPage();
  
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
      expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME}}}');
    });
  
  });

});

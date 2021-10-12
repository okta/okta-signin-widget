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
/* global oktaSignIn */
const PrimaryAuthPage = require('../page-objects/PrimaryAuthPage'),
    OIDCAppPage     = require('../page-objects/OIDCAppPage'),
    util            = require('../util/util');

const clientIds = ['{{{WIDGET_WEB_CLIENT_ID}}}', '{{{WIDGET_SPA_CLIENT_ID}}}'];

describe('Dev Mode flows', function() {

  function renderWidget() {
    function renderAndRedirect() {
      oktaSignIn.renderEl(
        {},
        function(res) {
          if (res.status === 'SUCCESS') {
            res.session.setCookieAndRedirect('{{{WIDGET_TEST_SERVER}}}' + '/app/UserHome');
          }
        }
      );
    }
    browser.executeScript(renderAndRedirect);
  }

  beforeEach(function() {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('basic-dev');
  });

  afterEach(function() {
    // Logout of Okta session
    browser.get('{{{WIDGET_TEST_SERVER}}}/login/signout');

    const el = element(by.css('#okta-sign-in'));
    browser.wait(protractor.ExpectedConditions.presenceOf(el), 2000);
    expect(el.isDisplayed()).toBe(true);
  });

  it('can hide, show, remove, and start a widget', function() {
    renderWidget();
    // Ensure the widget exists
    const el = element(by.css('#okta-sign-in'));
    expect(el.isDisplayed()).toBe(true);

    // Ensure the widget can hide
    browser.executeScript('oktaSignIn.hide()');
    expect(el.isDisplayed()).toBe(false);

    // Ensure the widget can be unhidden
    browser.executeScript('oktaSignIn.show()');
    expect(el.isDisplayed()).toBe(true);

    // Ensure the widget can be removed
    browser.executeScript('oktaSignIn.remove()');
    expect(el.isPresent()).toBe(false);

    // Ensure a new widget can be created
    function createWidget() {
      oktaSignIn.renderEl({}, function() {});
    }
    browser.executeScript(createWidget);
    expect(el.isDisplayed()).toBe(true);
  });

  clientIds.forEach(clientId => {
    it('can login and return tokens using the showSignInToGetTokens method', function() {
      const options = {
        clientId,
        redirectUri: 'http://localhost:3000/done',
        scopes: ['openid', 'profile']
      };
  
      browser.executeScript(`oktaSignIn.showSignInToGetTokens(${JSON.stringify(options)}).then(addTokensToPage);`);
  
      // Ensure the widget exists
      const el = element(by.css('#okta-sign-in'));
      expect(el.isDisplayed()).toBe(true);
  
      const primaryAuth = new PrimaryAuthPage(),
          oidcApp = new OIDCAppPage();
  
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
      expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME}}}');
    });
  
    it('can login and receive tokens on a callback using the showSignInAndRedirect method', function() {
      const options = {
        clientId,
        redirectUri: 'http://localhost:3000/done',
        scopes: ['openid', 'profile']
      };
  
      browser.executeScript(`oktaSignIn.showSignInAndRedirect(${JSON.stringify(options)})`);
  
      // Ensure the widget exists
      const el = element(by.css('#okta-sign-in'));
      expect(el.isDisplayed()).toBe(true);
  
      const primaryAuth = new PrimaryAuthPage(),
          oidcApp = new OIDCAppPage();
  
      primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
      expect(oidcApp.getIdTokenUser()).toBe('{{{WIDGET_BASIC_NAME}}}');
    });
  
  });

});

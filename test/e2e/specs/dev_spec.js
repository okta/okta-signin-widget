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
/* global browser, element, by, oktaSignIn */
var PrimaryAuthPage = require('../page-objects/PrimaryAuthPage'),
    OIDCAppPage     = require('../page-objects/OIDCAppPage'),
    util            = require('../util/util');

describe('Dev Mode flows', function() {
  function setup(options) {
    browser.executeScript('initialize(' + JSON.stringify(options) + ')');
  }

  beforeEach(function() {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('basic-dev');
  });

  it('can hide, show, remove, and start a widget', function() {
    setup({
      baseUrl: '{{{WIDGET_TEST_SERVER}}}'
    });
    // Ensure the widget exists
    var el = element(by.css('#okta-sign-in'));
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
      oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function() {});
    }
    browser.executeScript(createWidget);
    expect(el.isDisplayed()).toBe(true);
  });

  it('log a console message when tokens are not parsed from the URL after the Widget is rendered', function() {
    setup({
      baseUrl: '{{{WIDGET_TEST_SERVER}}}'
    });

    // Ensure the widget exists
    var el = element(by.css('#okta-sign-in'));
    expect(el.isDisplayed()).toBe(true);

    // Reload the page with a token in the URL
    browser.executeScript('window.location = window.location + "#id_token=abc"');
    browser.refresh(true);

    setup({
      baseUrl: '{{{WIDGET_TEST_SERVER}}}'
    });

    expectToFindLogMessage('Looks like there are still tokens in the URL!');
  });

  it('can parse tokens from the url', function() {
    setup({
      baseUrl: '{{{WIDGET_TEST_SERVER}}}',
      clientId: '{{{WIDGET_CLIENT_ID}}}',
      redirectUri: 'http://localhost:3000/done',
      authParams: {
        responseType: 'id_token',
        display: 'page',
        scope: ['openid', 'email', 'profile']
      }
    });

    var primaryAuth = new PrimaryAuthPage(),
        oidcApp = new OIDCAppPage();

    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
    oidcApp.callParseTokens();
    expect(oidcApp.getIdTokenUser()).toBe('Saml Jackson');
  });

  it('can parse tokens from the url with default handlers', function() {
    setup({
      baseUrl: '{{{WIDGET_TEST_SERVER}}}',
      clientId: '{{{WIDGET_CLIENT_ID}}}',
      redirectUri: 'http://localhost:3000/done',
      authParams: {
        responseType: 'id_token',
        display: 'page',
        scope: ['openid', 'email', 'profile']
      }
    });

    var primaryAuth = new PrimaryAuthPage(),
        oidcApp = new OIDCAppPage();

    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
    oidcApp.callParseAndStoreTokens();
    expect(oidcApp.getIdTokenUser()).toBe('Saml Jackson');
  });

  it('can parse tokens from the url with default handlers given token keys', function() {
    setup({
      baseUrl: '{{{WIDGET_TEST_SERVER}}}',
      clientId: '{{{WIDGET_CLIENT_ID}}}',
      redirectUri: 'http://localhost:3000/done',
      authParams: {
        responseType: 'id_token',
        display: 'page',
        scope: ['openid', 'email', 'profile']
      }
    });

    var primaryAuth = new PrimaryAuthPage(),
        oidcApp = new OIDCAppPage();

    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');

    oidcApp.callParseAndStoreTokensGivenKeys({ ID_TOKEN: 'my-id-token' });
    expect(oidcApp.getIdTokenUser()).toBe('Saml Jackson');
  });

  it('logs an error when attempting to parse tokens from the url with default handlers', function() {
    setup({
      baseUrl: '{{{WIDGET_TEST_SERVER}}}',
      clientId: '{{{WIDGET_CLIENT_ID}}}',
      redirectUri: 'http://localhost:3000/done',
      authParams: {
        responseType: 'id_token',
        display: 'page',
        scope: ['openid', 'email', 'profile']
      }
    });

    var primaryAuth = new PrimaryAuthPage(),
        oidcApp = new OIDCAppPage();

    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');

    // Remove the hash fragment from the URL
    oidcApp.changeRedirectUriState('fakeState123');
    oidcApp.callParseAndStoreTokens();
    expectToFindLogMessage('OAuth flow response state doesn\'t match request state');
  });

  function expectToFindLogMessage(text) {
    browser.manage().logs().get('browser')
    .then(function(logs) {
      var log = logs.find(function(entry) {
        var message = text;
        return entry.message.includes(message) === true;
      });
      expect(log).toBeDefined();
    })
    .catch(function(err) {
      expect(err).toBeUndefined();
    });
  }
});

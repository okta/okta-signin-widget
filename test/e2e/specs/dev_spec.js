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
var PrimaryAuthPage = require('../page-objects/PrimaryAuthPage'),
    OIDCAppPage     = require('../page-objects/OIDCAppPage'),
    util            = require('../util/util');

describe('Dev Mode flows', function() {

  function renderWidget() {
    function renderAndRedirect() {
      oktaSignIn.renderEl(
        { el: '#okta-login-container' },
        function (res) {
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

  it('can hide, show, remove, and start a widget', function() {
    renderWidget();
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

  it('can login and return tokens using the setupWithShowSignInToGetTokens method', function () {
    var options = {
      el: '#okta-login-container',
      clientId: 'rW47c465c1wc3MKzHznu',
      redirectUri: 'http://localhost:3000/done',
      scope: 'openid profile'
    };

    browser.executeScript(`oktaSignIn.showSignInToGetTokens(${JSON.stringify(options)})`);

    // Ensure the widget exists
    var el = element(by.css('#okta-sign-in'));
    expect(el.isDisplayed()).toBe(true);

    var primaryAuth = new PrimaryAuthPage(),
        oidcApp = new OIDCAppPage();

    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
    expect(oidcApp.getIdTokenUser()).toBe('Saml Jackson');
  });

  it('log a console message when tokens are not parsed from the URL after the Widget is rendered', function() {
    renderWidget();
    // Ensure the widget exists
    var el = element(by.css('#okta-sign-in'));
    expect(el.isDisplayed()).toBe(true);

    // Reload the page with a token in the URL
    browser.executeScript('window.location = window.location + "#id_token=abc"');
    browser.refresh(true);

    renderWidget();

    expectToFindLogMessage('Looks like there are still tokens in the URL!');
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

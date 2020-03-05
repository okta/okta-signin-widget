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
/* global browser, element, by, oktaSignIn, options, OktaSignIn */
var PrimaryAuthPage = require('../page-objects/PrimaryAuthPage'),
    OktaHomePage = require('../page-objects/OktaHomePage'),
    util = require('../util/util');

// Initialize the eyes SDK
var Eyes = require('eyes.selenium').Eyes;
var eyes = new Eyes();

describe('Basic flows', function () {
  var primaryAuth = new PrimaryAuthPage();

  beforeEach(function () {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('basic');
  });

  it('can hide, show, remove, and start a widget', async () => {
    await eyes.open(browser, 'Widget-E2E', 'Basic Spec - Widget operations');

    // Ensure the widget exists
    var el = element(by.css('#okta-sign-in'));
    var signInTitle = element(by.css('[data-se="o-form-head"]'));
    expect(el.isDisplayed()).toBe(true);
    expect(signInTitle.getText()).toBe('Sign In');

    // Visual checkpoint #1
    await eyes.checkWindow('Widget Exists');

    // Ensure the widget can hide
    await browser.executeScript('oktaSignIn.hide()');
    expect(el.isDisplayed()).toBe(false);

    // Visual checkpoint #2
    await eyes.checkWindow('Widget Hidden');

    // Ensure the widget can be unhidden
    await browser.executeScript('oktaSignIn.show()');
    expect(el.isDisplayed()).toBe(true);

    // Ensure the widget can be removed
    await browser.executeScript('oktaSignIn.remove()');
    expect(el.isPresent()).toBe(false);

    // Ensure a new widget can be created
    function createWidget () {
      options.i18n = {
        en: {
          'primaryauth.title': 'Sign In to Acme'
        }
      };
      // eslint-disable-next-line no-global-assign
      oktaSignIn = new OktaSignIn(options);
      oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function () {});
    }
    browser.executeScript(createWidget);
    expect(el.isDisplayed()).toBe(true);
    expect(signInTitle.getText()).toBe('Sign In to Acme');

    // Visual checkpoint #2
    await eyes.checkWindow('Widget Title');

    // End the test.
    await eyes.close();
  });

  it('modifies the error banner using an afterError event', async () => {
    await eyes.open(browser, 'Widget-E2E', 'Basic Spec - Widget error');

    // Ensure the widget exists
    var el = element(by.css('#okta-sign-in'));
    expect(el.isDisplayed()).toBe(true);

    primaryAuth.loginToForm('foo', 'bar');
    var errorBox = element(by.className('okta-form-infobox-error'));
    util.waitForElement(errorBox);
    expect(errorBox.getText()).toBe('Custom Error!');

    await eyes.checkWindow('Custom error');
    await eyes.close();
  });

  it('has the style from config.colors', async () => {
    await eyes.open(browser, 'Widget-E2E', 'Basic Spec - Widget config');

    // Create new widget with colors.brand
    await browser.executeScript('oktaSignIn.remove()');
    function createWidget () {
      options.colors = {
        brand: '#008000'
      };
      // eslint-disable-next-line no-global-assign
      oktaSignIn = new OktaSignIn(options);
      oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function () {});
    }
    await browser.executeScript(createWidget);

    // Check that the color has been applied
    var primaryButton = element(by.css('#okta-signin-submit'));
    expect(primaryButton.getCssValue('background')).toContain(('rgb(0, 128, 0)')); // #008000 in rgb

    await eyes.checkWindow('Background color');
    await eyes.close();
  });

  it('redirects to successful page when features.redirectByFormSubmit is on', async () => {
    browser.executeScript('oktaSignIn.remove()');
    function createWidget () {
      options.features = {
        redirectByFormSubmit: true,
      };
      // eslint-disable-next-line no-global-assign
      oktaSignIn = new OktaSignIn(options);
      oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function (res) {
        if (res.status === 'SUCCESS') {
          res.session.setCookieAndRedirect(options.baseUrl + '/app/UserHome');
        }
      });
    }
    browser.executeScript(createWidget);

    var primaryAuth = new PrimaryAuthPage();
    var oktaHome = new OktaHomePage();

    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
    oktaHome.waitForPageLoad();
  });

});

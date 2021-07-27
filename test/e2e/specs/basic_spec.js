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
/* global oktaSignIn, options, OktaSignIn */
const PrimaryAuthPage = require('../page-objects/PrimaryAuthPage'),
    OktaHomePage = require('../page-objects/OktaHomePage'),
    util = require('../util/util');

describe('Basic flows', function() {
  const primaryAuth = new PrimaryAuthPage();

  beforeEach(function() {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('basic');
  });

  it('can hide, show, remove, and start a widget', function() {
    // Ensure the widget exists
    const el = element(by.css('#okta-sign-in'));
    const signInTitle = element(by.css('[data-se="o-form-head"]'));
    expect(el.isDisplayed()).toBe(true);
    expect(signInTitle.getText()).toBe('Sign In');

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
      options.i18n = {
        en: {
          'primaryauth.title': 'Sign In to Acme'
        }
      };
      // eslint-disable-next-line no-global-assign
      oktaSignIn = new OktaSignIn(options);
      oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function() {});
    }
    browser.executeScript(createWidget);
    expect(el.isDisplayed()).toBe(true);
    expect(signInTitle.getText()).toBe('Sign In to Acme');
  });

  it('modifies the error banner using an afterError event', function() {
    // Ensure the widget exists
    const el = element(by.css('#okta-sign-in'));
    expect(el.isDisplayed()).toBe(true);

    primaryAuth.loginToForm('foo', 'bar');
    const errorBox = element(by.className('okta-form-infobox-error'));
    util.waitForElement(errorBox);
    expect(errorBox.getText()).toBe('Custom Error!');
  });

  it('has the style from config.colors', function() {
    /*global browserName*/
    // In IE, primaryButton.getCssValue('background') is empty. Expectation on line 97 fails
    if (browserName === 'internet explorer') {
      return;
    }

    // Create new widget with colors.brand
    browser.executeScript('oktaSignIn.remove()');
    function createWidget() {
      options.colors = {
        brand: '#008000'
      };
      // eslint-disable-next-line no-global-assign
      oktaSignIn = new OktaSignIn(options);
      oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function() {});
    }
    browser.executeScript(createWidget);

    // Check that the color has been applied
    const primaryButton = element(by.css('#okta-signin-submit'));
    expect(primaryButton.getCssValue('background')).toContain(('rgb(0, 128, 0)')); // #008000 in rgb
  });

  it('redircts to successful page when features.redirectByFormSubmit is on', function() {
    // TODO: remove when OKTA-415707 is resolved
    if (process.env.ORG_OIE_ENABLED) {
      console.error('test is disabled: OKTA-415707');
      return;
    }
    browser.executeScript('oktaSignIn.remove()');
    function createWidget() {
      options.features = {
        redirectByFormSubmit: true,
      };
      // eslint-disable-next-line no-global-assign
      oktaSignIn = new OktaSignIn(options);
      oktaSignIn.renderEl({
        el: '#okta-login-container'
      }, function(res) {
        if (res.status === 'SUCCESS') {
          res.session.setCookieAndRedirect(options.baseUrl + '/app/UserHome');
        }
      });
    }
    browser.executeScript(createWidget);

    const primaryAuth = new PrimaryAuthPage();
    const oktaHome = new OktaHomePage();

    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');
    oktaHome.waitForPageLoad();
  });

});

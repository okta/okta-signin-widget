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
var util = require('../util/util');

describe('Dev Mode flows', function() {

  beforeEach(function() {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('basic-dev');
  });

  it('can hide, show, remove, and start a widget', function() {
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

  it('can call authClient methods', function() {
    // Ensure the widget exists
    var el = element(by.css('#okta-sign-in'));
    expect(el.isDisplayed()).toBe(true);

    function getToken() {
      return oktaSignIn.authClient.tokenManager.get('idToken');
    }

    // Set a fake token into localStorage
    var token = JSON.stringify({
      idToken: { foo: 'bar' }
    });
    browser.executeScript(`window.localStorage.setItem('okta-token-storage', '${token}');`);

    // Retrieve the token
    browser.executeScript(getToken).then(function(storedToken) {
      expect(storedToken).toEqual({foo: 'bar'});
    });
  });
});

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
var PrimaryAuthPage = require('../page-objects/PrimaryAuthPage'),
    OktaHomePage = require('../page-objects/OktaHomePage'),
    util = require('../util/util'),
    Expect = require('../util/Expect');

describe('OIDC flows', function() {
  var primaryAuth = new PrimaryAuthPage(),
      oktaHome = new OktaHomePage();

  beforeEach(function() {
    browser.driver.get('about:blank');
    browser.ignoreSynchronization = true;
    util.loadTestPage('npm');
  });

  afterEach(function () {
    // Logout of Okta session
    browser.get('{{{WIDGET_TEST_SERVER}}}/login/signout');
  });

  it('can login and auth in a basic flow', function() {
    Expect.toBeA11yCompliant();
    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER_3}}}', '{{{WIDGET_BASIC_PASSWORD_3}}}');
    oktaHome.waitForPageLoad();
    Expect.toBeA11yCompliant();
    expect(oktaHome.getLoggedInUser()).toEqual('Test');
  });

});

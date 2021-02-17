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

var OIEPrimaryAuthPage = require('../page-objects/OIEPrimaryAuthPage');
var until = protractor.ExpectedConditions;

describe('OIE Angular flows', function () {
  it('should allow logging in with the widget', function () {
    // open browser to a protected route
    browser.ignoreSynchronization = true;
    browser.driver.get('http://localhost:4200/protected');

    // expect to see widget
    var widget = element(by.css('[id="okta-sign-in"]'));
    browser.wait(until.presenceOf(widget), 10000, 'Unable to find widget');

    // log in to widget
    var oiePrimaryAuth = new OIEPrimaryAuthPage();
    oiePrimaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');

    // expect to see protected
    var protectedText = element(by.xpath('//app-secure[text()="Protected endpoint!"]'));
    browser.wait(until.presenceOf(protectedText), 10000, 'Not able to detect protected route');

    // log out of Okta session
    browser.get('{{{WIDGET_TEST_SERVER}}}/login/signout');
  });
});

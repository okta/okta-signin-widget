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
/* global browser */

var PrimaryAuthPage = require('../page-objects/PrimaryAuthPage');
var until = protractor.ExpectedConditions;

describe('React flows', function() {
  it('should allow logging in with the widget', function() {
    // open browser to a protected route
    browser.ignoreSynchronization = true;
    browser.driver.get('http://localhost:3001/protected');

    // expect to see widget
    var widget = element(by.css('#okta-sign-in'));
    browser.wait(until.presenceOf(widget), 2000, 'Unable to find widget');

    // log in to widget
    var primaryAuth = new PrimaryAuthPage();
    primaryAuth.loginToForm('{{{WIDGET_BASIC_USER}}}', '{{{WIDGET_BASIC_PASSWORD}}}');

    // expect to see protected
    var protectedText = element(by.xpath('//h3[text()="Protected"]'));
    browser.wait(until.presenceOf(protectedText), 3000, 'Not able to detect protected route');
  });
});

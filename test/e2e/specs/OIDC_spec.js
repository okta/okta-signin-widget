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
    OIDCAppPage = require('../page-objects/OIDCAppPage'),
    util = require('../util/util');

describe('OIDC flows', function() {
  var primaryAuth = new PrimaryAuthPage(),
      oidcApp = new OIDCAppPage();

  beforeEach(function() {
    browser.ignoreSynchronization = true;
    util.loadTestPage('oidc');
  });
  
  it('can login to Okta and exchange a sessionToken for an idToken', function() {
    primaryAuth.setUsername('{{{WIDGET_BASIC_USER}}}');
    primaryAuth.setPassword('{{{WIDGET_BASIC_PASSWORD}}}');
    primaryAuth.submit();
    expect(oidcApp.getMessage()).toEqual('user: Saml Jackson');
  });
});

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
'use strict';

var EC = protractor.ExpectedConditions;

class AppPage {

  constructor() {
    this.pageEl = $('#page');
    this.idTokenUserEl = $('#idtoken_user');
    this.accessTokenTypeEl = $('#accesstoken_type');
  }

  getIdTokenUser() {
    browser.wait(EC.presenceOf(this.idTokenUserEl));
    return this.idTokenUserEl.getText();
  }

  getAccessTokenType() {
    browser.wait(EC.presenceOf(this.accessTokenTypeEl));
    return this.accessTokenTypeEl.getText();
  }

  getCodeFromQuery() {
    browser.wait(EC.presenceOf(this.pageEl));
    return browser.getCurrentUrl().then(function (url) {
      var matches = url.match(/code=([^&]+)/i);
      return matches && matches[1];
    });
  }

  callParseTokens() {
    browser.wait(EC.presenceOf(this.pageEl));
    browser.executeScript('parseTokens()');
  }

  callParseAndStoreTokens() {
    browser.wait(EC.presenceOf(this.pageEl));
    browser.executeScript('parseAndStoreTokens()');
  }

  callParseAndStoreTokensGivenKeys(keys) {
    browser.wait(EC.presenceOf(this.pageEl));
    browser.executeScript(`parseAndStoreTokensGivenKeys(${JSON.stringify(keys)})`);
  }

  changeRedirectUriState(state) {
    browser.wait(EC.presenceOf(this.pageEl));
    browser.executeScript(`window.location.hash = window.location.hash.split("state=")[0] + "state=${state}"`);
  }
}

module.exports = AppPage;

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
'use strict';

const EC = protractor.ExpectedConditions;

class AppPage {

  constructor() {
    this.pageEl = $('#page');
    this.idTokenUserEl = $('#idtoken_user');
    this.accessTokenTypeEl = $('#accesstoken_type');
    this.locationSearch = $('#location_search');
    this.locationHash = $('#location_hash');
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
    browser.wait(EC.presenceOf(this.locationSearch));
    return this.locationSearch.getText().then(function(search) {
      const matches = search.match(/code=([^&]+)/i);
      return matches && matches[1];
    });
  }

  getCodeFromHash() {
    browser.wait(EC.presenceOf(this.locationHash));
    return this.locationHash.getText().then(function(hash) {
      const matches = hash.match(/code=([^&]+)/i);
      return matches && matches[1];
    });
  }
}

module.exports = AppPage;

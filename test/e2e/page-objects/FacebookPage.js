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

class FacebookPage {
  login(username, password) {
    $('#email').clear();
    $('#email').sendKeys(username);
    $('#pass').sendKeys(password);
    $('[name=login]').click();
  }

  logout() {
    const bookmarkElemId = '#bookmarks_jewel';
    browser.get('https://m.facebook.com/');
    browser.wait(EC.presenceOf($(bookmarkElemId)), 5000);
    $(bookmarkElemId).click();
    browser.wait(EC.presenceOf($('[data-sigil=logout]')), 5000);
    $('[data-sigil=logout]').click();
  }

}

module.exports = FacebookPage;

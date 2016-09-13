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
/*jshint esversion:6, es3:false */
/*global $, protractor */
'use strict';

var EC = protractor.ExpectedConditions;

class FacebookPage {

  login(username, password) {
    $('#email').sendKeys(username);
    $('#pass').sendKeys(password);
    $('[name=login]').click();
  }

  logout() {
    browser.get('https://m.facebook.com/');
    $('#bookmarks_jewel').click();
    browser.wait(EC.presenceOf($('[data-sigil=logout]')), 5000);
    $('[data-sigil=logout]').click();
  }

}

module.exports = FacebookPage;

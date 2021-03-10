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

const FormPage = require('./FormPage'),
    FacebookPage = require('./FacebookPage');

function getSocialIdpPage (idp) {
  switch (idp) {
  case 'facebook':
    return new FacebookPage();
  default:
    throw new Error('Unknown social IDP: ' + idp);
  }
}

class PrimaryAuthPage extends FormPage {

  constructor () {
    super();
    this.usernameInput = this.input('username');
    this.passwordInput = this.input('password');
  }

  getFormClass () {
    return 'primary-auth';
  }

  loginToForm (username, password) {
    this.usernameInput.sendKeys(username);
    this.passwordInput.sendKeys(password);
    this.submit();
  }

  loginToSocialIdpPopup (idp, username, password) {
    this.socialAuthButton(idp).click();
    browser.getAllWindowHandles().then(function (handles) {
      const parent = handles[0],
          popup = handles[1];
      browser.switchTo().window(popup);
      getSocialIdpPage(idp).login(username, password);
      browser.switchTo().window(parent);
    });
  }

  loginToSocialIdpRedirect (idp, username, password) {
    this.socialAuthButton(idp).click();
    getSocialIdpPage(idp).login(username, password);
  }

  socialAuthButton (idp) {
    return this.$dataSe('social-auth-' + idp + '-button');
  }

}

module.exports = PrimaryAuthPage;

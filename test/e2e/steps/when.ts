/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { When } from '@cucumber/cucumber';
import PrimaryAuthPage from '../page-objects/primary-auth-oie.page';
import ActionContext from '../support/context';
import TestAppPage from '../page-objects/test-app.page';
import { waitForLoad } from '../util/waitUtil';

When(
  /^user logs in with username and password$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    return await PrimaryAuthPage.login(this.credentials.emailAddress, this.credentials.password);
  }
);

When(
  /^user logs in using 3rd party IdP$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    const {
      WIDGET_BASIC_USER,
      WIDGET_BASIC_PASSWORD,
    } = process.env;
    return await PrimaryAuthPage.loginOktaOIDCIdP(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
  }
);

When(
  /^user navigates to forgot password form$/,
  async function() {
    await PrimaryAuthPage.clickForgotPasswordButton();
    return await PrimaryAuthPage.waitForForgotPassword();
  }
);

When(
  /^user opens another instance in a new tab$/,
  async function() {
    await TestAppPage.openInNewTab();
    await TestAppPage.startButton.click();
    return await waitForLoad(TestAppPage.widget);
  }
);


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


/* eslint-disable max-len */
import { Then } from '@cucumber/cucumber';
import TestAppPage from '../page-objects/test-app.page';
import ActionContext from '../support/context';
import PrimaryAuthPage from '../page-objects/primary-auth-oie.page';

Then(
  /^user sees the tokens on the page$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    await TestAppPage.assertAccessToken();
    const fullName = this.credentials.firstName + " " + this.credentials.lastName
    return await TestAppPage.assertIDToken(fullName);
  }
);

Then(
  /^user sees the tokens on the page from 3rd party IdP$/,
  async function() {
    const {
      WIDGET_BASIC_NAME,
    } = process.env;

    await TestAppPage.assertAccessToken();
    return await TestAppPage.assertIDToken(WIDGET_BASIC_NAME);
  }
);

Then(
  /^user sees primary signin form and not forgot password form$/,
  async function() {
    return await PrimaryAuthPage.waitForPrimaryAuthForm();
  }
);

Then(
  /^user sees forgot password form$/,
  async function() {
    return await PrimaryAuthPage.waitForForgotPassword();
  }
);

Then(
  /^user sees signup form$/,
  async function() {
    return await PrimaryAuthPage.waitForSignupForm();
  }
);

Then(
  /^user sees unlock account form$/,
  async function() {
    return await PrimaryAuthPage.waitForUnlockAccountForm();
  }
);
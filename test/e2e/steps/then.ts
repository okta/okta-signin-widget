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
import ChallengeEmailAuthenticatorPage from '../page-objects/challenge-email-authenticator.page';
import SetupAuthenticatorPage from '../page-objects/setup-authenticator.page';
import ResetPasswordPage from '../page-objects/reset-password.page';
import EnrollPasswordPage from '../page-objects/enroll-password-authenticator.page';
import EnrollPhonePage from '../page-objects/enroll-phone-authenticator.page';
import VerifyPhoneAuthenticatorPage from '../page-objects/verify-phone-authenticator.page';
import UnlockPage from '../page-objects/unlock.page.js';

Then(
  /^user sees the tokens on the page$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    await this.saveScreenshot('tokens');
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
  /^user sees the id_token on the page$/,
  async function() {
    const {
      WIDGET_BASIC_NAME,
    } = process.env;
    return await TestAppPage.assertIDToken(WIDGET_BASIC_NAME);
  }
);

Then(
  /^user sees the access_token on the page$/,
  async function() {
    await TestAppPage.assertAccessToken();
  }
);

Then(
  /^user sees the authorization_code on the page$/,
  async function() {
    await TestAppPage.assertCode();
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
    this.saveScreenshot('user-sees-forgot-password-form');
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
Then(
  /^user is locked out$/,
  async function() {
    return await TestAppPage.assertWidgetUnableToSignin();
  }
);

Then(
  /^user account is unlocked$/,
  async function() {
    return await UnlockPage.assertUnlockMessage();
  }
);

Then(
  /^user is challenged for email code$/,
  async function() {
    return await ChallengeEmailAuthenticatorPage.waitForPageLoad();
  }
);

Then(
  /^user clicks send email$/,
  async function() {
    return await ChallengeEmailAuthenticatorPage.sendEmail();
  }
);

Then(
  /^user skips enrollment of optional authenticators$/,
  async function() {
    await SetupAuthenticatorPage.waitForPageLoad();
    await SetupAuthenticatorPage.setupLater();
  }
);

Then(
  /^widget is hidden on the page$/,
  async function() {
    await TestAppPage.assertWidget(false);
  }
);

Then(
  /^widget is shown on the page$/,
  async function() {
    await TestAppPage.assertWidget(true);
  }
);

Then(
  /^widget is removed from the page$/,
  async function() {
    await TestAppPage.assertWidgetRemoved();
  }
);

Then(
  /^widget displays customized title$/,
  async function() {
    await TestAppPage.assertWidgetCustomTitle();
  }
);

Then(
  /^widget background shows the updated color$/,
  async function() {
    await TestAppPage.assertWidgetBackgroundColor();
  }
);

Then(
  /^user sees the CSP error on the page$/,
  async function() {
    await TestAppPage.assertCSPError('eval blocked due to CSP rule script-src from script-src http://localhost:3000 https://global.oktacdn.com');
  }
);

Then(
  /^user sees an error message "([\w\s.]+)"$/, async (errorMessage: string) => {
    await TestAppPage.assertWidgetSigninError(errorMessage);
  });

Then(
  /^user sees the password reset page$/,
  async function() {
    await ResetPasswordPage.waitForPageLoad();
  }
);

Then(
  /^user sees the password enroll page$/,
  async function() {
    await EnrollPasswordPage.waitForPageLoad();
  }
);

Then(
  /^user sees the phone enroll page$/,
  async function() {
    await EnrollPhonePage.waitForPageLoad();
  }
);

Then(
  /^user is challenged for sms code$/,
  async function() {
    return await VerifyPhoneAuthenticatorPage.waitForPageLoad();
  }
);


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
import VerifyEmailAuthenticatorPage from '../page-objects/verify-email-authenticator.page';
import SetupAuthenticatorPage from '../page-objects/setup-authenticator.page';
import BiometricAuthenticatorPage from '../page-objects/biometric-authenticator.page';
import ResetPasswordPage from '../page-objects/reset-password.page';
import RegistrationPage from '../page-objects/registration.page';
import EnrollPhonePage from '../page-objects/enroll-phone-authenticator.page';
import VerifyPhoneAuthenticatorPage from '../page-objects/verify-phone-authenticator.page';
import UnlockPage from '../page-objects/unlock.page.js'

When(
  /^user logs in with username and password$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    return await PrimaryAuthPage.login(this.credentials.emailAddress, this.credentials.password);
  }
);

When(
    /^user logs in with username and wrong password 5 times$/,
    async function() {
        let n=0;
        while(n<5) {
            await waitForLoad(TestAppPage.widget);
            await PrimaryAuthPage.login(this.credentials.emailAddress, "userR1234");
            await browser.pause(1000);
            n++;
        }
        return
    }
);

When(
  /^existing user logs in with username and password$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    const {
      WIDGET_BASIC_USER,
      WIDGET_BASIC_PASSWORD,
    } = process.env;
    await waitForLoad(TestAppPage.widget);
    return await PrimaryAuthPage.login(WIDGET_BASIC_USER, WIDGET_BASIC_PASSWORD);
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
  /^user clicks the signup link$/,
  async function() {
    await PrimaryAuthPage.clickSignUpLink();
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

When(
  /^user selects biometric authenticator$/,
  async function() {
    await SetupAuthenticatorPage.waitForPageLoad();
    await SetupAuthenticatorPage.selectBiometricAuthenticator();
  }
);

When(
  /^user sets up biometric authenticator$/,
  async function() {
    browser.addVirtualAuthenticator('ctap2', 'internal', true, true, true, true);
    await BiometricAuthenticatorPage.waitForPageLoad();
    await BiometricAuthenticatorPage.setupBiometricAuthenticator();
  }
);

When(
  /^user inputs the correct code from email$/,
  async function() {
    await VerifyEmailAuthenticatorPage.waitForPageLoad();
    let code = '';
    if (process.env.LOCAL_MONOLITH) {
      code = await this.monolithClient.getEmailCode(this.credentials.emailAddress);
    } else {
      code = await this.a18nClient.getEmailCode(this.credentials.profileId);
    }
    await VerifyEmailAuthenticatorPage.enterCode(code);
  }
);

When(
  /^user clicks unlock account$/,
  async function() {
    await PrimaryAuthPage.clickUnlockButton();
    await browser.pause(1000)
  }
)

When(
    /^user selects email to unlock account$/,
    async function() {
        await UnlockPage.selectEmailToUnlock();
    }
);

When (
    /^user enters passowrd to unlock$/,
    async function() {
        await UnlockPage.enterPasswordAndVerify(this.credentials.password);
}
);

When(
  /^user clicks the email magic link$/,
  async function() {
    const emailMagicLink = await this.a18nClient.getEmailMagicLink(this.credentials.profileId);
    await browser.url(emailMagicLink);
  }
);

When(
  /^user clicks the hide button$/,
  async function() {
    TestAppPage.hideButton.click();
  }
);

When(
  /^user clicks the show button$/,
  async function() {
    TestAppPage.showButton.click();
  }
);

When(
  /^user clicks the remove button$/,
  async function() {
    TestAppPage.removeButton.click();
  }
);

When(
  /^user triggers CSP failure in the test app$/,
  async function() {
    TestAppPage.triggerCspFail.click();
  }
);

When(
  /^user submits their email$/,
  async function() {
    return await PrimaryAuthPage.enterUsername(this.credentials.emailAddress);
  }
);

When(
    /^user submits their email to unlock$/,
    async function() {
        return await UnlockPage.enterUserEmailToUnlock(this.credentials.emailAddress);
    }
);

When(
  /^user clicks the password reset magic link$/,
  async function() {
    let passwordResetMagicLink;
    if (process.env.LOCAL_MONOLITH) {
      passwordResetMagicLink = await this.monolithClient.getPasswordResetMagicLink(this.credentials.emailAddress);
    } else {
      passwordResetMagicLink = await this.a18nClient.getPasswordResetMagicLink(this.credentials.profileId);
    }
    await browser.url(passwordResetMagicLink);
  }
);

When(
    /^user clicks the unlock account magic link$/,
    async function() {
      let unlockAccountLink;
      if (process.env.LOCAL_MONOLITH) {
        unlockAccountLink = await this.monolithClient.getUnlockAccountLink(this.credentials.emailAddress);
      } else {
        unlockAccountLink = await this.a18nClient.getUnlockAccountLink(this.credentials.profileId);
      }
      await browser.url(unlockAccountLink);
    }
);

When(
  /^user fills in new password$/,
  async function() {
    await ResetPasswordPage.enterNewPassword();
  }
);

When(
  /^user submits the form$/,
  async function() {
    await ResetPasswordPage.submit();
  }
);

When(
/^user fills out their profile details$/,
  // eslint-disable-next-line no-unused-vars
  async function(this: ActionContext) {
    await RegistrationPage.enterProfileDetails(this.credentials.emailAddress, this.credentials.lastName, this.credentials.firstName);
  }
);

When(
  /^user selects email authenticator$/,
  async function() {
    await SetupAuthenticatorPage.waitForPageLoad();
    await SetupAuthenticatorPage.selectEmailAuthenticator();
  }
);

When(
  /^user selects password authenticator$/,
  async function() {
    await SetupAuthenticatorPage.waitForPageLoad();
    await SetupAuthenticatorPage.selectPasswordAuthenticator();
  }
);

When(
  /^user selects phone authenticator$/,
  async function() {
    await SetupAuthenticatorPage.waitForPageLoad();
    await SetupAuthenticatorPage.selectPhoneAuthenticator();
  }
);

When(
  /^user enters their phone number$/,
  async function() {
    // Remove the 1st characters '+1'
    await EnrollPhonePage.enterPhoneNumber(this.credentials.phoneNumber.slice(2));
  }
);

When(
  /^user enters the SMS code$/,
  async function() {
    let code = '';
    if (process.env.LOCAL_MONOLITH) {
      code = await this.monolithClient.getSMSCode(this.credentials.phoneNumber);
    } else {
      code = await this.a18nClient.getSMSCode(this.credentials.profileId);
    }
    await VerifyPhoneAuthenticatorPage.enterCode(code);
  }
);
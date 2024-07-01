/* eslint-disable max-len */
import { waitForLoad } from '../util/waitUtil';

const { BUNDLE } = process.env;

class PrimaryAuthOIEPage {
  identifierFieldSelector = 'input[name="identifier"]';

  get enrollProfileButton() { return $('[data-se=enroll]'); }

  get forgotPassword() { return $(BUNDLE === 'next' ? 'form[data-se="o-form"]' : '.siw-main-view.identify-recovery.forgot-password'); }
  get forgotPasswordButton() { return $('[data-se="forgot-password"]'); }
  get unlockButton() {return $('[data-se="unlock"]');}
  get nextButton() { return $('[value="Next"]'); }
  get signupForm() { return $(BUNDLE === 'next' ? 'form[data-se="o-form"]' : '.siw-main-view.enroll-profile.registration'); }
  get signupLink() { return $('a[data-se="enroll"]'); }
  get unlockAccountForm() { return $(BUNDLE === 'next' ? 'form[data-se="o-form"]' : '.siw-main-view.select-authenticator-unlock-account'); }
  get primaryAuthForm() { return $(BUNDLE === 'next' ? 'form[data-se="o-form"]' : '.siw-main-view.primary-auth'); }
  get identifierField() { return $(this.identifierFieldSelector); }
  get passwordField() { return $('input[name="credentials.passcode"]'); }
  get submitButton() { return $(BUNDLE === 'next' ? 'button[data-se="save"]' : 'input[data-type="save"]'); }
  get formTitle() { return $('[data-se="o-form-head"]'); }
  get oktaOidcIdPButton() { return $('[data-se="social-auth-general-idp-button"]'); }

  async waitForForgotPassword() {
    if (BUNDLE === 'next') {
      await browser.waitUntil(async () => {
        const formTitle = await this.formTitle;
        return (await formTitle.isDisplayed()) && (await formTitle.getText()) === 'Reset your password';
      }, 10_000, 'wait for page title');
    } else {
      await waitForLoad(this.forgotPassword);
    }
  }

  async waitForSubmitButton() {
    await waitForLoad(this.submitButton);
  }

  async waitForPrimaryAuthForm() {
    if (BUNDLE === 'next') {
      await waitForLoad(this.identifierField);
      await waitForLoad(this.passwordField);
      await waitForLoad(this.submitButton);
    } else {
      await waitForLoad(this.primaryAuthForm);
    }
  }

  async clickEnrollProfileButton() {
    await this.enrollProfileButton.click();
  }

  async clickForgotPasswordButton() {
    await this.forgotPasswordButton.click();
  }

  async clickUnlockButton() {
    await this.unlockButton.click();
  }

  async clickSignUpLink() {
    await this.signupLink.click();
  }

  async login(username, password) {
    await this.identifierField.setValue(username);
    await this.passwordField.setValue(password);
    await this.submitButton.click();
  }

  async loginOktaOIDCIdP(username, password) {
    await this.oktaOidcIdPButton.click();
    await this.identifierField.setValue(username);
    await this.passwordField.setValue(password);
    await this.submitButton.click();
  }

  async enterUsername(username) {
    await this.identifierField.setValue(username);
    await this.submitButton.click();
  }

  async waitForSignupForm() {
    if (BUNDLE === 'next') {
      await browser.waitUntil(async () => {
        const formTitle = await this.formTitle;
        return (await formTitle.isDisplayed()) && (await formTitle.getText()) === 'Sign up';
      }, 10_000, 'wait for page title');
    } else {
      await waitForLoad(this.signupForm);
    }
  }

  async waitForUnlockAccountForm() {
    if (BUNDLE === 'next') {
      await browser.waitUntil(async () => {
        const formTitle = await this.formTitle;
        return (await formTitle.isDisplayed()) && (await formTitle.getText()) === 'Unlock account?';
      }, 10_000, 'wait for page title');
    } else {
      await waitForLoad(this.unlockAccountForm);
    }
  }
}

export default new PrimaryAuthOIEPage();

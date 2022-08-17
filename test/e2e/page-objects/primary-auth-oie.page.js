import { waitForLoad } from '../util/waitUtil';

class PrimaryAuthOIEPage {
  get enrollProfileButton() { return $('[data-se=enroll]'); }

  get forgotPassword() { return $('.siw-main-view.identify-recovery.forgot-password'); }
  get forgotPasswordButton() { return $('[data-se="forgot-password"]'); }
  get nextButton() { return $('[value="Next"]'); }
  get signupForm() { return $('.siw-main-view.enroll-profile.registration'); }
  get signupLink() { return $('a[data-se="enroll"]'); }
  get unlockAccountForm() { return $('.siw-main-view.select-authenticator-unlock-account'); }

  get primaryAuthForm() { return $('.siw-main-view.primary-auth'); }
  get identifierField() { return $('input[name="identifier"]'); }
  get passwordField() { return $('input[name="credentials.passcode"]'); }
  get submitButton() { return $('input[data-type="save"]'); }
  get formTitle() { return $('[data-se="o-form-head"]'); }

  get oktaOidcIdPButton() { return $('[data-se="social-auth-general-idp-button"]'); }

  async waitForForgotPassword() {
    await waitForLoad(this.forgotPassword);
  }

  async waitForSubmitButton() {
    await waitForLoad(this.submitButton);
  }

  async waitForPrimaryAuthForm() {
    await waitForLoad(this.primaryAuthForm);
  }


  async clickEnrollProfileButton() {
    await this.enrollProfileButton.click();
  }

  async clickForgotPasswordButton() {
    await this.forgotPasswordButton.click();
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
    await waitForLoad(this.signupForm);
  }

  async waitForUnlockAccountForm() {
    await waitForLoad(this.unlockAccountForm);
  }
}

export default new PrimaryAuthOIEPage();

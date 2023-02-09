class ChallengePasswordPage {
  passwordFieldSelector = 'input[name="credentials.passcode"]';
  get mainContent() { return $('.siw-main-view.challenge-authenticator--okta_password.mfa-verify-password'); }
  get passwordField() { return $('input[name="credentials.passcode"]'); }
  get backToSignInLink() { return $('a[data-se="cancel"]'); }
  get submitButton() { return $('input[data-type="save"]'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async enterPassword(password) {
    await this.passwordField.setValue(password);
    await this.submitButton.click();
  }

  async clickBackToSignIn() {
    await this.backToSignInLink.isClickable().then((clickable) => {
      if(clickable) {
        this.backToSignInLink.click();
      }
    });
  }
}
  
export default new ChallengePasswordPage();

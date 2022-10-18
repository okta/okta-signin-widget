class VerifyEmailAuthenticatorPage {
  get mainContent() { return $('.challenge-authenticator--okta_email'); }
  get enterCodeButton() { return $('.enter-auth-code-instead-link'); }
  get enterCodeText() { return $('input[name="credentials.passcode"]'); }
  get verifyButton() { return $('input[type="submit"]'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async enterCode(code) {
    await this.enterCodeButton.isDisplayed().then((displayed) => {
      if (displayed) {
        this.enterCodeButton.click();
      }
    });

    await this.enterCodeText.isDisplayed().then((displayed) => {
      if(displayed) {
        this.enterCodeText.setValue(code);
      }
    });

    await this.verifyButton.isClickable().then((clickable) => {
      if(clickable) {
        this.verifyButton.click();
      }
    });
  }
}
  
export default new VerifyEmailAuthenticatorPage();

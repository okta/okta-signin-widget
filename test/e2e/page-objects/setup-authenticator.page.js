class SetupAuthenticatorPage {
  get mainContent() { return $('.authenticator-enroll-list.authenticator-list'); }
  get biometricAuthenticatorSetup() { return $('div[data-se="webauthn"] > a'); }
  get setupLaterButton() { return $('a[data-se="button"].skip-all'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async selectBiometricAuthenticator() {
    await this.biometricAuthenticatorSetup.isClickable().then((clickable) => {
      if(clickable) {
        this.biometricAuthenticatorSetup.click();
      }
    });
  }

  async setupLater() {
    await this.setupLaterButton.isClickable().then((clickable) => {
      if(clickable) {
        this.setupLaterButton.click();
      }
    });   
  }
}
  
export default new SetupAuthenticatorPage();

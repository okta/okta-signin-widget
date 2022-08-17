class SetupAuthenticatorPage {
  get mainContent() { return $('.authenticator-enroll-list.authenticator-list'); }
  get biometricAuthenticatorSetup() { return $('div[data-se="webauthn"] > a'); }
  get emailAuthenticatorSetup() { return $('div[data-se="okta_email"] > a'); }
  get passwordAuthenticatorSetup() { return $('div[data-se="okta_password"] > a'); }
  get phoneAuthenticatorSetup() { return $('div[data-se="phone_number"] > a'); }
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

  async selectEmailAuthenticator() {
    await this.emailAuthenticatorSetup.isClickable().then((clickable) => {
      if(clickable) {
        this.emailAuthenticatorSetup.click();
      }
    });
  }

  async selectPasswordAuthenticator() {
    await this.passwordAuthenticatorSetup.isClickable().then((clickable) => {
      if(clickable) {
        this.passwordAuthenticatorSetup.click();
      }
    });
  }

  async selectPhoneAuthenticator() {
    await this.phoneAuthenticatorSetup.isClickable().then((clickable) => {
      if(clickable) {
        this.phoneAuthenticatorSetup.click();
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

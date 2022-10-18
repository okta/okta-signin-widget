class BiometricAuthenticatorPage {
  get mainContent() { return $('.oie-enroll-webauthn'); }
  get biometricAuthenticatorSetup() { return $('a[data-se="button"].webauthn-setup'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async setupBiometricAuthenticator() {
    await this.biometricAuthenticatorSetup.isClickable().then((clickable) => {
      if(clickable) {
        this.biometricAuthenticatorSetup.click();
      }
    });
  }  
}
  
export default new BiometricAuthenticatorPage();

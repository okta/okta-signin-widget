class VerifyPhoneAuthenticatorPage {
  get mainContent() { return $('.siw-main-view.enroll-authenticator--phone_number.enroll-sms'); }
  get enterCodeText() { return $('input[name="credentials.passcode"]'); }
  get verifyButton() { return $('input[type="submit"]'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async enterCode(code) {
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
  
export default new VerifyPhoneAuthenticatorPage();

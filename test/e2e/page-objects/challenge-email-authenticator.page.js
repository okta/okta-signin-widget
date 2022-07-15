class ChallengeEmailAuthenticatorPage {
  get mainContent() { return $('.authenticator-verification-data--okta_email'); }
  get sendEmailButton() { return $('input[type=submit]'); }
  
  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async sendEmail() {
    await this.sendEmailButton.isClickable().then((clickable) => {
      if(clickable) {
        this.sendEmailButton.click();
      }
    });
  }
}
  
export default new ChallengeEmailAuthenticatorPage();

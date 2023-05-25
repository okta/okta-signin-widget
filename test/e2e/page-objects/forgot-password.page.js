class ForgotPasswordPage {
  get mainContent() { return $('.siw-main-view.identify-recovery.forgot-password'); }
  get identifierField() { return $('input[name="identifier"]'); }
  get submitButton() { return $('input[data-type="save"]'); }
  get backButton() { return $('[data-se="cancel"]'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async clickBackToSignin() {
    await this.backButton.click();
  }
}

export default new ForgotPasswordPage();

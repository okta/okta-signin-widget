class EnrollPasswordPage {
  get mainContent() { return $('.siw-main-view.enroll-authenticator--okta_password.enroll-password'); }
  get passwordField() { return $('input[name="credentials.passcode"]'); }
  get confirmPasswordField() { return $('input[name="confirmPassword"]'); }
  get submitButton() { return $('input[data-type="save"]'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async enterNewPassword() {
    await this.passwordField.isDisplayed().then((displayed) => {
      if(displayed) {
        this.passwordField.setValue('_H|/nt3r_2_');
        this.confirmPasswordField.setValue('_H|/nt3r_2_');
      }
    });
  }

  async submit() {
    await this.submitButton.isClickable().then((clickable) => {
      if(clickable) {
        this.submitButton.click();
      }
    });
  }
}
  
export default new EnrollPasswordPage();

class RegistrationPage {
  get mainContent() { return $('.siw-main-view.enroll-profile.registration'); }
  get emailField() { return $('input[name="userProfile.email"]'); }
  get lastNameField() { return $('input[name="userProfile.lastName"]'); }
  get firstNameField() { return $('input[name="userProfile.firstName"]'); }
  get submitButton() { return $('input[data-type="save"]'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async enterProfileDetails(email, lastName, firstName) {
    this.emailField.setValue(email);
    this.lastNameField.setValue(lastName);
    this.firstNameField.setValue(firstName);
  }

  async submit() {
    await this.submitButton.isClickable().then((clickable) => {
      if(clickable) {
        this.submitButton.click();
      }
    });
  }
}
  
export default new RegistrationPage();

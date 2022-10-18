class EnrollPhonePage {
  get mainContent() { return $('.siw-main-view.authenticator-enrollment-data--phone_number'); }
  get phoneNumberField() { return $('input[name="authenticator.phoneNumber"]'); }
  get submitButton() { return $('input[data-type="save"]'); }

  async waitForPageLoad() {
    return browser.waitUntil(async () => 
      this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for main content');
  }

  async enterPhoneNumber(phoneNumber) {
    await this.phoneNumberField.isDisplayed().then((displayed) => {
      if(displayed) {
        this.phoneNumberField.setValue(phoneNumber);
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
  
export default new EnrollPhonePage();

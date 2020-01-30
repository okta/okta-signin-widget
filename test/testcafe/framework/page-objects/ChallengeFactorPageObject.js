import BasePageObject from './BasePageObject';

export default class ChallengeFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getPageSubTitle(selector) {
    return this.form.getElement(selector).textContent;
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getInvalidOTPError() {
    return this.form.getErrorBoxText();
  }

  getResendEmailViewCallout() {
    return this.form.getElement('.resend-email-view p').textContent;
  }

  resendEmailView() {
    return this.form.getElement('.resend-email-view');
  }

  async clickResendEmailButton() {
    await this.form.clickElement('.resend-email-view a.button');
  }

}

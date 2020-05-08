import BasePageObject from './BasePageObject';

const SWITCH_FACTOR_SELECTOR = '.auth-footer .js-switchFactor';
const FORGOT_PASSWORD_SELECTOR = '.auth-footer .js-forgot-password';
export default class ChallengeFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  switchFactorExists() {
    return this.form.elementExist(SWITCH_FACTOR_SELECTOR);
  }

  forgotPasswordExists() {
    return this.form.elementExist(FORGOT_PASSWORD_SELECTOR);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getInvalidOTPError() {
    return this.form.getErrorBoxText();
  }

  resendEmailView() {
    return this.form.getElement('.resend-email-view');
  }

  async clickSendAgainLink() {
    await this.form.clickElement('.resend-email-view a.resend-link');
  }

  getSaveButtonLabel() {
    return this.form.getElement('.button-primary').value;
  }
}

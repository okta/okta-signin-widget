import BasePageObject from './BasePageObject';
import { Selector } from 'testcafe';

const SWITCH_FACTOR_SELECTOR = '.auth-footer .js-switchFactor';
const FORGOT_PASSWORD_SELECTOR = '.auth-footer .js-forgot-password';
const SWITCH_AUTHENTICATOR_SELECTOR = '.auth-footer .js-switchAuthenticator';
const PASSWORD_FIELD = 'credentials\\.passcode';

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

  switchAuthenticatorExists() {
    return this.form.elementExist(SWITCH_AUTHENTICATOR_SELECTOR);
  }

  getSwitchAuthenticatorButtonText() {
    return Selector(SWITCH_AUTHENTICATOR_SELECTOR).textContent;
  }

  forgotPasswordExists() {
    return this.form.elementExist(FORGOT_PASSWORD_SELECTOR);
  }

  getForgotPasswordButtonText() {
    return Selector(FORGOT_PASSWORD_SELECTOR).textContent;
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

  /**
   * @deprecated 
   */
  resendEmailView() {
    return this.form.getElement('.resend-email-view');
  }

  hasPasswordError() {
    return this.form.hasTextBoxError(PASSWORD_FIELD);
  }

  hasPasswordErrorMessage() {
    return this.form.hasTextBoxErrorMessage(PASSWORD_FIELD);
  }

  waitForPasswordError() {
    return this.form.waitForTextBoxError(PASSWORD_FIELD);
  }

  getPasswordErrorMessage() {
    return this.form.getTextBoxErrorMessage(PASSWORD_FIELD);
  }

  /**
   * @deprecated 
   */
  async clickSendAgainLink() {
    await this.form.clickElement('.resend-email-view a.resend-link');
  }

  getSaveButtonLabel() {
    return this.form.getElement('.button-primary').value;
  }
}

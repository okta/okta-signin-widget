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

  elementExists(selector) {
    return this.form.elementExist(selector);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  clickElement(selector) {
    return this.form.clickElement(selector);
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

  resendEmailView(resendContainer = '.resend-email-view') {
    return this.form.getElement(`${resendContainer}`);
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

  async clickSendAgainLink(resendContainer = '.resend-email-view') {
    await this.form.clickElement(`${resendContainer} a.resend-link`);
  }

  getSaveButtonLabel(saveButtonSelector = '.button-primary') {
    return this.form.getElement(saveButtonSelector).value;
  }

  elementHasClass(elementSelector, className) {
    return this.form.getElement(elementSelector).hasClass(className);
  }
}

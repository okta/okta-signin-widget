import BasePageObject from './BasePageObject';
import { Selector } from 'testcafe';

const PASSCODE_FIELD_NAME = 'credentials.passcode';
const SWITCH_FACTOR_SELECTOR = '.auth-footer .js-switchFactor';
const SWITCH_AUTHENTICATOR_SELECTOR = '.auth-footer .js-switchAuthenticator';

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

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  clickVerifyButton() {
    return this.form.clickSaveButton('Verify');
  }

  /**
   * @deprecated
   * @see getTitle
   */
  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getInvalidOTPError() {
    return this.form.getErrorBoxText();
  }

  getErrorFromErrorBox() {
    return this.form.getErrorBoxText();
  }

  getInvalidOTPFieldError() {
    return this.form.getTextBoxErrorMessage(PASSCODE_FIELD_NAME);
  }

  /**
   * @deprecated
   * @see ChallengeEmailPageObject
   */
  resendEmailView() {
    return this.form.getElement('.resend-email-view');
  }

  /**
   * @deprecated
   * @see ChallengeEmailPageObject
   */
  async clickSendAgainLink() {
    await this.form.clickElement('.resend-email-view a.resend-link');
  }

  getSaveButtonLabel() {
    return this.form.getElement('.button-primary').value;
  }
}

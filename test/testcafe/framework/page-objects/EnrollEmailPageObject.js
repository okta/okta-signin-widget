import BasePageObject from './BasePageObject';
import ResendEmailObject from './components/ResendEmailObject';
import { Selector } from 'testcafe';

const CODE_FIELD_NAME = 'credentials.passcode';
const ENTER_CODE_FROM_EMAIL = '.enter-auth-code-instead-link';

export default class EnrollAuthenticatorPhonePageObject extends BasePageObject {

  constructor(t) {
    super(t);
    this.resendEmail = new ResendEmailObject(t, this.form.el);
  }

  enterCode(value) {
    return this.form.setTextBoxValue(CODE_FIELD_NAME, value);
  }

  getCodeFieldError() {
    return this.form.getTextBoxErrorMessage(CODE_FIELD_NAME);
  }

  async enterCodeFromEmailLinkExists() {
    const elCount = await Selector(ENTER_CODE_FROM_EMAIL).count;
    return elCount === 1;
  }

  async clickElement(selector) {
    await this.form.clickElement(selector);
  }

}

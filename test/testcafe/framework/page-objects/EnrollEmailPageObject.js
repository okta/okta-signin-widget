import BasePageObject from './BasePageObject';
import ResendEmailObject from './components/ResendEmailObject';

const CODE_FIELD_NAME = 'credentials.passcode';

export default class EnrollAuthenticatorPhonePageObject extends BasePageObject {

  constructor (t) {
    super(t);
    this.resendEmail = new ResendEmailObject(t, this.form.el);
  }

  enterCode(value) {
    return this.form.setTextBoxValue(CODE_FIELD_NAME, value);
  }

  getCodeFieldError() {
    return this.form.getTextBoxErrorMessage(CODE_FIELD_NAME);
  }

}

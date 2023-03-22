import BasePageObject from './BasePageObject';

export default class EnrollPhonePageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickReceiveSmsCodeButton() {
    return this.form.clickButton('Receive a code via SMS');
  }

  phoneNumberFieldExists() {
    return this.form.fieldByLabelExists('Phone number');
  }

  fillPhoneNumber(value) {
    return this.form.setTextBoxValue('Phone number', value, true);
  }

  hasErrorBox() {
    return this.form.getErrorBox().exists;
  }

  getErrorBoxText() {
    return this.form.getErrorBoxText();
  }
}

import BasePageObject from './BasePageObject';

const confirmPasswordFieldName = 'confirmPassword';

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

  getConfirmPasswordError() {
    return this.form.getTextBoxErrorMessage(confirmPasswordFieldName);
  }

  hasErrorBox() {
    return this.form.hasErrorBox();
  }

  getErrorBoxText() {
    return this.form.getErrorBoxText();
  }
}

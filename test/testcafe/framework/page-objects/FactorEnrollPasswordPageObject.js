import BasePageObject from './BasePageObject';

const passwordFieldName = 'credentials\\.passcode';
const confirmPasswordFieldName = 'confirmPassword';

export default class EnrollPasswordPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  passwordFieldExists() {
    return this.form.elementExist(`input[name="${passwordFieldName}"]`);
  }

  confirmPasswordFieldExists() {
    return this.form.elementExist(`input[name="${confirmPasswordFieldName}"]`);
  }

  fillPassword(value) {
    return this.form.setTextBoxValue(passwordFieldName, value);
  }

  fillConfirmPassword(value) {
    return this.form.setTextBoxValue(confirmPasswordFieldName, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  hasPasswordError() {
    return this.form.hasTextBoxError(passwordFieldName);
  }

  getPasswordError() {
    return this.form.getTextBoxErrorMessage(passwordFieldName);
  }

  hasConfirmPasswordError() {
    return this.form.hasTextBoxError(confirmPasswordFieldName);
  }

  getConfirmPasswordError() {
    return this.form.getTextBoxErrorMessage(confirmPasswordFieldName);
  }
}

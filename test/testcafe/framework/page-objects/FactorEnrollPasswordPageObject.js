import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

const passwordFieldName = 'credential\\.value';
const confirmPasswordFieldName = 'confirmPassword';

export default class EnrollPasswordPageObject extends BasePageObject {
  constructor (t) {
    super(t);
    this.form = new BaseFormObject(t);
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

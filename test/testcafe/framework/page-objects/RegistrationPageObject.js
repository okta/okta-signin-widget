import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

export default class RegistrationPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.form = new BaseFormObject(t);
  }

  fillFirstNameField(value) {
    return this.form.setTextBoxValue('firstName', value);
  }

  fillLastNameField(value) {
    return this.form.setTextBoxValue('lastName', value);
  }

  setRememberMeField(value) {
    return this.form.setCheckbox('remember', value);
  }

  getFirstNameValue() {
    return this.form.getTextBoxValue('firstName');
  }

  getLastNameValue() {
    return this.form.getTextBoxValue('lastName');
  }

  getRememberMeValue() {
    return this.form.getCheckboxValue('remember');
  }

  focusSignInButton() {
    return this.form.focusSaveButton();
  }

  clickSignInButton() {
    return this.form.clickSaveButton();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  hasFirstNameError() {
    return this.form.hasTextBoxError('firstName');
  }

  hasFirstNameErrorMessage() {
    return this.form.hasTextBoxErrorMessage('firstName');
  }

  hasLastNameError() {
    return this.form.hasTextBoxError('lastName');
  }

  hasLastNameErrorMessage() {
    return this.form.hasTextBoxErrorMessage('lastName');
  }

  waitForLastNameError() {
    return this.form.waitForTextBoxError('lastName');
  }
}

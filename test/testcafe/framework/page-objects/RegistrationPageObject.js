import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

const FIRSTNAME_FIELD = 'userProfile.firstName';
const LASTNAME_FIELD = 'userProfile.lastName';
export default class RegistrationPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.form = new BaseFormObject(t);
  }

  fillFirstNameField(value) {
    return this.form.setTextBoxValue(FIRSTNAME_FIELD, value);
  }

  fillLastNameField(value) {
    return this.form.setTextBoxValue(LASTNAME_FIELD, value);
  }

  setRememberMeField(value) {
    return this.form.setCheckbox('remember', value);
  }

  getFirstNameValue() {
    return this.form.getTextBoxValue(FIRSTNAME_FIELD);
  }

  getLastNameValue() {
    return this.form.getTextBoxValue(LASTNAME_FIELD);
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
    return this.form.hasTextBoxError(FIRSTNAME_FIELD);
  }

  hasFirstNameErrorMessage() {
    return this.form.hasTextBoxErrorMessage(FIRSTNAME_FIELD);
  }

  hasLastNameError() {
    return this.form.hasTextBoxError(LASTNAME_FIELD);
  }

  hasLastNameErrorMessage() {
    return this.form.hasTextBoxErrorMessage(LASTNAME_FIELD);
  }

  waitForLastNameError() {
    return this.form.waitForTextBoxError(LASTNAME_FIELD);
  }
}

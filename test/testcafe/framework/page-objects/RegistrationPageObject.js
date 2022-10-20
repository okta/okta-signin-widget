import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';

const FIRSTNAME_FIELD = 'userProfile\\.firstName';
const LASTNAME_FIELD = 'userProfile\\.lastName';
const EMAIL_FIELD = 'userProfile\\.email';
export default class RegistrationPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  fillFirstNameField(value) {
    return this.form.setTextBoxValue(FIRSTNAME_FIELD, value);
  }

  fillLastNameField(value) {
    return this.form.setTextBoxValue(LASTNAME_FIELD, value);
  }

  fillEmailField(value) {
    return this.form.setTextBoxValue(EMAIL_FIELD, value);
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

  getEmail() {
    return this.form.getTextBoxValue(EMAIL_FIELD);
  }

  getRememberMeValue() {
    return this.form.getCheckboxValue('remember');
  }

  focusRegisterButton() {
    return this.form.focusSaveButton();
  }

  clickRegisterButton() {
    return this.form.clickSaveButton('Sign Up');
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getErrorBoxText() {
    return this.form.getErrorBoxText();
  }

  hasFirstNameError() {
    return this.form.hasTextBoxErrorMessage(FIRSTNAME_FIELD);
  }

  hasFirstNameErrorMessage() {
    return this.form.hasTextBoxErrorMessage(FIRSTNAME_FIELD);
  }

  hasLastNameError() {
    return this.form.hasTextBoxErrorMessage(LASTNAME_FIELD);
  }

  hasLastNameErrorMessage() {
    return this.form.hasTextBoxErrorMessage(LASTNAME_FIELD);
  }

  hasEmailError() {
    return this.form.hasTextBoxErrorMessage(EMAIL_FIELD);
  }

  hasEmailErrorMessage() {
    return this.form.hasTextBoxErrorMessage(EMAIL_FIELD);
  }

  waitForLastNameError() {
    return this.form.waitForTextBoxError(LASTNAME_FIELD);
  }

  waitForEmailError() {
    return this.form.waitForTextBoxError(EMAIL_FIELD);
  }

  getEmailErrorMessage() {
    return this.form.getTextBoxErrorMessage(EMAIL_FIELD);
  }

  getNthEmailErrorMessage(value) {
    return this.form.getNthErrorMessage(EMAIL_FIELD, value);
  }

  alreadyHaveAccountExists() {
    const text = 'Already have an account?';
    if (userVariables.v3) {
      return this.form.getByText(text).exists;
    }
    return this.form.getByText(text, { selector: 'a' }).exists;
  }

  formFieldExistsByLabel(label) {
    return this.form.getByLabelText(label).exists;
  }

  terminalMessageExist(message) {
    return this.form.getByText(message).exists;
  }
}

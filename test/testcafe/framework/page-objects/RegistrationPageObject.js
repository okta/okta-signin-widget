import BasePageObject from './BasePageObject';
import { Selector, userVariables } from 'testcafe';

const FIRSTNAME_FIELD = 'userProfile\\.firstName';
const LASTNAME_FIELD = 'userProfile\\.lastName';
const EMAIL_FIELD = 'userProfile\\.email';

const BACK = 'a[data-se="back"]';
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

  hasEmailError(index = undefined) {
    return this.form.hasTextBoxErrorMessage(EMAIL_FIELD, index);
  }

  hasEmailErrorMessage(index = undefined) {
    return this.form.hasTextBoxErrorMessage(EMAIL_FIELD, index);
  }

  waitForLastNameError() {
    return this.form.waitForTextBoxError(LASTNAME_FIELD);
  }

  waitForEmailError() {
    return this.form.waitForTextBoxError(EMAIL_FIELD);
  }

  getEmailErrorMessage(index = undefined) {
    return this.form.getTextBoxErrorMessage(EMAIL_FIELD, index);
  }

  getNthEmailErrorMessage(value) {
    return this.form.getNthErrorMessage(EMAIL_FIELD, value);
  }

  alreadyHaveAccountExists() {
    if (userVariables.v3) {
      return this.form.getByText('Already have an account?').exists;
    }
    return Selector(BACK).exists;
  }

  terminalMessageExist(message) {
    return this.form.getByText(message).exists;
  }
}

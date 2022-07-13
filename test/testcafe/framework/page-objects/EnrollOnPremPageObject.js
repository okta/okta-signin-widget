import BasePageObject from './BasePageObject';

const PASSCODE_FIELD_NAME = 'credentials.passcode';
const USER_NAME_FIELD_NAME = 'credentials.clientData';
const FORM_INFOBOX_ERROR = '.o-form-error-container .infobox-error';

export default class EnrollOnPremPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  passcodeFieldExists() {
    return this.form.elementExist(`input[name="${PASSCODE_FIELD_NAME}"]`);
  }

  passcodeFieldType() {
    return this.form.getElement(`input[name="${PASSCODE_FIELD_NAME}"]`).getAttribute('type');
  }

  userNameFieldExists() {
    return this.form.elementExist(`input[name="${USER_NAME_FIELD_NAME}"]`);
  }

  getPasscodeValue() {
    return this.form.getTextBoxValue(PASSCODE_FIELD_NAME);
  }

  fillPasscode(value) {
    return this.form.setTextBoxValue(PASSCODE_FIELD_NAME, value);
  }

  fillUserName(value) {
    return this.form.setTextBoxValue(USER_NAME_FIELD_NAME, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  async waitForErrorBox() {
    await this.form.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBox() {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }

  hasPasscodeError() {
    return this.form.hasTextBoxError(PASSCODE_FIELD_NAME);
  }

  getPasscodeError() {
    return this.form.getTextBoxErrorMessage(PASSCODE_FIELD_NAME);
  }

  hasUserNameError() {
    return this.form.hasTextBoxError(USER_NAME_FIELD_NAME);
  }

  getUserNameError() {
    return this.form.getTextBoxErrorMessage(USER_NAME_FIELD_NAME);
  }
}

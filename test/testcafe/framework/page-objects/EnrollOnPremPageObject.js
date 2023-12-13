import BasePageObject from './BasePageObject';

const PASSCODE_FIELD_NAME = 'credentials.passcode';
const USER_NAME_FIELD_NAME = 'credentials.clientData';

export default class EnrollOnPremPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  passcodeFieldExists() {
    return this.form.elementExist(`input[name="${PASSCODE_FIELD_NAME}"]`);
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

  clickNextButton(label) {
    return this.form.clickSaveButton(label);
  }

  async waitForGeneralErrorBox() {
    await this.form.waitForErrorBox();
  }

  getErrorBoxText() {
    return this.form.getAlertBox().innerText;
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

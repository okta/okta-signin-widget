import BasePageObject from './BasePageObject';

const USER_CODE_FIELD = 'userCode';

export default class DeviceCodeActivatePageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getPageSubtitle() {
    return this.form.getElement('.okta-form-subtitle').textContent;
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getGlobalErrors() {
    return this.form.getErrorBoxText();
  }

  getActivationCodeTextBoxLabel() {
    return this.form.getFormFieldLabel(USER_CODE_FIELD);
  }

  isActivateCodeTextBoxVisible() {
    return this.form.findFormFieldInput(USER_CODE_FIELD).visible;
  }

  setActivateCodeTextBoxValue(value) {
    return this.form.setTextBoxValue(USER_CODE_FIELD, value);
  }

  fillIdentifierField(value) {
    return this.form.setTextBoxValue('identifier', value);
  }

  fillPasswordField(value) {
    return this.form.setTextBoxValue('credentials.passcode', value);
  }

  getTerminalContent(){
    return this.form.getTerminalContent();
  }
}

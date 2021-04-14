import BasePageObject from './BasePageObject';
import {Selector} from 'testcafe';

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

  getActivateCodeTextBoxValue() {
    return this.form.getTextBoxValue(USER_CODE_FIELD);
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

  isTerminalSuccessIconPresent() {
    return this.form.getElement('.device-code-terminal--icon.success-24-green').exists;
  }

  isTerminalErrorIconPresent() {
    return this.form.getElement('.device-code-terminal--icon.error-24-red').exists;
  }

  isBeaconTerminalPresent() {
    return this.beacon.find('[data-se="factor-beacon"]').exists;
  }

  isTryAgainButtonPresent() {
    return Selector('[data-se="try-again"]').exists;
  }
}

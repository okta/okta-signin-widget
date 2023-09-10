import BasePageObject from './BasePageObject';
import {Selector} from 'testcafe';
import { userVariables } from 'testcafe';

const USER_CODE_FIELD = 'userCode';

export default class DeviceCodeActivatePageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getPageSubtitle() {
    if (userVariables.v3) {
      return this.form.getElement('[data-se="o-form-explain"]').textContent;
    }
    return this.form.getElement('.okta-form-subtitle').textContent;
  }

  clickNextButton(name) {
    if (userVariables.v3) {
      return this.form.clickSaveButton(name);
    }
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

  isIdentifierFieldVisible() {
    return this.form.findFormFieldInput('identifier').visible;
  }

  fillIdentifierField(value) {
    return this.form.setTextBoxValue('identifier', value);
  }

  fillPasswordField(value) {
    return this.form.setTextBoxValue('credentials.passcode', value);
  }

  getTerminalTitle() {
    if (userVariables.v3) {
      return this.form.getAlertBoxText();
    }
    return this.getFormTitle();
  }

  getTerminalContent(){
    if (userVariables.v3) {
      return this.getPageSubtitle();
    }
    return this.form.getTerminalContent();
  }

  isTerminalSuccessIconPresent() {
    if (userVariables.v3) {
      return this.form.getElement('.infobox-success').exists && this.form.getElement('.MuiAlert-icon').exists;
    }
    return this.form.getElement('.device-code-terminal--icon.success-24-green').exists;
  }

  isTerminalErrorIconPresent() {
    if (userVariables.v3) {
      return this.form.getElement('.infobox-error').exists && this.form.getElement('.MuiAlert-icon').exists;
    }
    return this.form.getElement('.device-code-terminal--icon.error-24-red').exists;
  }

  isBeaconTerminalPresent() {
    return Selector('[data-se="factor-beacon"]').exists;
  }

  isTryAgainButtonPresent() {
    if (userVariables.v3) {
      return Selector('[data-se="cancel"]').exists;
    }
    return Selector('[data-se="try-again"]').exists;
  }
}

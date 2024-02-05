import BasePageObject from '../page-objects/BasePageObject';
import {Selector} from 'testcafe';

const USER_CODE_FIELD = 'userCode';

export default class DeviceCodeActivatePageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getPageSubtitle() {
    return this.form.getElement('.okta-form-subtitle').textContent;
  }

  activationCodeFieldExists() {
    return this.form.fieldByLabelExists('Activation Code');
  }

  signInFormUsernameFieldExists() {
    return this.form.fieldByLabelExists('Username');
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

  isUserNameFieldVisible() {
    return this.form.findFormFieldInput('username').visible;
  }

  // TODO: OKTA-436775 Move some of this code that's unrelated to device flow out of this page object into a more generic
  isPasswordFieldVisible() {
    return this.form.findFormFieldInput('password').visible;
  }

  fillUserNameField(value) {
    return this.form.setTextBoxValue('username', value);
  }

  fillPasswordField(value) {
    return this.form.setTextBoxValue('password', value);
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
    return Selector('[data-se="factor-beacon"]').exists;
  }

  isTryAgainButtonPresent() {
    return Selector('[data-se="try-again"]').exists;
  }

  getErrorBoxText() {
    return Selector('.okta-form-infobox-error p').innerText;
  }

  hasIDPRedirectPageHeader() {
    return Selector('h1').withText('An external IdP login page for testcafe testing').exists;
  }
}

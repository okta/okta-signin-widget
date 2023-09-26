import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SymantecAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  getPageSubtitle() {
    if (userVariables.gen3) {
      return this.getFormSubtitle();
    }
    return this.form.getElement('.okta-form-subtitle').textContent;
  }

  submit(buttonName) {
    if (userVariables.gen3) {
      return this.form.clickButton(buttonName);
    }
    return this.form.clickSaveButton();
  }
}

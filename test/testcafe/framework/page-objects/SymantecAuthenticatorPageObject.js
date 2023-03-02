import BasePageObject from './BasePageObject';

export default class SymantecAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  getPageSubtitle() {
    return this.form.getElement('.okta-form-subtitle').textContent;
  }

  submit() {
    return this.form.clickSaveButton();
  }
}

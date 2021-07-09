import BasePageObject from './BasePageObject';

export default class YubiKeyAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  submit() {
    return this.form.clickSaveButton();
  }
}

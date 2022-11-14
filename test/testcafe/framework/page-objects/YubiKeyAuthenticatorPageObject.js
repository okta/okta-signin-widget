import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class YubiKeyAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  clickEnrollButton() {
    if(userVariables.v3) {
      return this.form.clickButton('Set up');
    }
    return this.clickVerifyButton();
  }

  clickVerifyButton() {
    return this.form.clickButton('Verify');
  }
}

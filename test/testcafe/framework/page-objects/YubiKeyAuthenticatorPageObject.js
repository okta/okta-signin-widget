import { userVariables } from 'testcafe';
import { screen } from '@testing-library/testcafe';
import BasePageObject from './BasePageObject';

export default class YubiKeyAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  async waitForYubikeyView() {
    await this.form.el.find('form').exists;
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

  getErrorBoxText() {
    if (userVariables.v3) {
      return screen.findAllByRole('alert').nth(0).innerText;
    }
    return this.form.getErrorBoxText();
  }
}

import BasePageObject from './BasePageObject';
import { Selector } from 'testcafe';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasPasswordSelectButton() {
    return this.form.elementExist('.enroll-factor-row > .enroll-factor-description > .enroll-factor-button');
  }

  hasPasswordIcon() {
    return this.form.elementExist('.enroll-factor-row > .enroll-factor-icon-container > .mfa-okta-password');
  }

  hasEmailIcon() {
    return this.form.elementExist('.enroll-factor-row > .enroll-factor-icon-container > .mfa-okta-email');
  }

  getPasswordLabel() {
    return Selector('.enroll-factor-row:first-child > .enroll-factor-description > .enroll-factor-label').textContent;
  }

  getEmailLabel() {
    return Selector('.enroll-factor-row:last-child > .enroll-factor-description > .enroll-factor-label').textContent;
  }

  async selectPasswordFactor() {
    await this.form.clickElement('.enroll-factor-row > .enroll-factor-description > .enroll-factor-button');
  }
}

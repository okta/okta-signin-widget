import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.form = new BaseFormObject(t);
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

  async selectPasswordFactor() {
    await this.form.clickElement('.enroll-factor-row > .enroll-factor-description > .enroll-factor-button');
  }
}

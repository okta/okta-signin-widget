import BaseFormObjectV3 from './components/BaseFormObjectV3';
import IdentityPageObject from './IdentityPageObject';

// const PASSWORD_FIELD_SELECTOR = '[data-se="credentials.passcode"]';
const PASSWORD_TOGGLE_SELECTOR = '[data-se="credentials.passcode"] + div button';
const FORGOT_PASSWORD_SELECTOR = '[data-se="forgot-password"]';

export default class IdentityPageObjectV3 extends IdentityPageObject {
  constructor(t) {
    super(t);
    // override super.form
    this.form = new BaseFormObjectV3(t);
  }

  async hasShowTogglePasswordIcon() {
    return await this.form.getElement(PASSWORD_TOGGLE_SELECTOR).count > 0;
  }

  getForgotPasswordLinkText() {
    return this.form.getElement(FORGOT_PASSWORD_SELECTOR).textContent;
  }
}

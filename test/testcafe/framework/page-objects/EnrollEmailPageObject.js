import BasePageObject from './BasePageObject';
import { Selector, userVariables } from 'testcafe';

const CODE_FIELD_NAME = 'credentials.passcode';
const ENTER_CODE_FROM_EMAIL_CLASS = '.enter-auth-code-instead-link';
const ENTER_CODE_FROM_EMAIL_TEXT = 'Enter a code from the email instead';
const RESEND_EMAIL = '.resend-email-view';
const RESEND_LINK = '.resend-link';

export default class EnrollAuthenticatorPhonePageObject extends BasePageObject {

  constructor(t) {
    super(t);
  }

  enterCode(value) {
    return this.form.setTextBoxValue(CODE_FIELD_NAME, value);
  }

  getCodeFieldError() {
    return this.form.getTextBoxErrorMessage(CODE_FIELD_NAME);
  }

  async enterCodeFromEmailLinkExists() {
    if (userVariables.v3) {
      const elCount = await Selector('[type="button"]').count;
      return elCount === 1;
    } else {
      const elCount = await Selector(ENTER_CODE_FROM_EMAIL_CLASS).count;
      return elCount === 1;
    }
  }

  async clickElement(selector) {
    await this.form.clickElement(selector);
  }

  async clickEnterCodeInstead() {
    if (userVariables.v3) {
      await this.form.clickButton(ENTER_CODE_FROM_EMAIL_TEXT);
    } else {
      await this.form.clickElement(ENTER_CODE_FROM_EMAIL_CLASS);
    }
  }

  async resendEmailExists() {
    if (userVariables.v3) {
      return Selector('[role="alert"]').exists;
    }

    const isHidden = await Selector(RESEND_EMAIL).hasClass('hide')
    return !isHidden;
  }

  resendEmailText() {
    if (userVariables.v3) {
      return this.form.el.find('[role="alert"]').textContent;
    }
      return this.form.el.find(RESEND_EMAIL).textContent;
  }

  async clickResendEmail() {
    if (userVariables.v3) {
      const resendEmail = this.form.getLink('Send again');
      await this.t.click(resendEmail);
    }
    else {
      const resendEmailLink = this.form.el.find(RESEND_LINK);
      await this.t.click(resendEmailLink);
    }
  }

  clickVerifyButton() {
    return this.form.clickSaveButton('Verify');
  }
}

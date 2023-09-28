import BasePageObject from './BasePageObject';
import { Selector, userVariables } from 'testcafe';

const CODE_FIELD_NAME = 'credentials.passcode';
const ENTER_CODE_FROM_EMAIL_CLASS = '.enter-auth-code-instead-link';
const ENTER_CODE_FROM_EMAIL_TEXT = 'Enter a verification code instead';
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
    if (userVariables.gen3) {
      return this.form.queryButton(ENTER_CODE_FROM_EMAIL_TEXT).exists;
    } 
    return Selector(ENTER_CODE_FROM_EMAIL_CLASS).exists;
  }

  async clickElement(selector) {
    await this.form.clickElement(selector);
  }

  async clickEnterCodeInstead() {
    if (userVariables.gen3) {
      await this.form.clickButton(ENTER_CODE_FROM_EMAIL_TEXT);
    } else {
      await this.form.clickElement(ENTER_CODE_FROM_EMAIL_CLASS);
    }
  }

  async resendEmailExists() {
    if (userVariables.gen3) {
      return this.form.hasErrorBox();
    }

    const isHidden = await Selector(RESEND_EMAIL).hasClass('hide');
    return !isHidden;
  }

  resendEmailText() {
    if (userVariables.gen3) {
      return this.form.el.find('[role="alert"]').textContent;
    }
    return this.form.el.find(RESEND_EMAIL).textContent;
  }

  async clickResendEmail() {
    if (userVariables.gen3) {
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

  async verificationLinkTextExists(emailAddress) {
    const text = await this.form.getSubtitle();

    return text.includes(`We sent an email to ${emailAddress}.`);
  }
}

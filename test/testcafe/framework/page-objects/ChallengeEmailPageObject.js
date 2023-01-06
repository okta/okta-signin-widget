import { userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const RESEND_EMAIL_VIEW_SELECTOR = '.resend-email-view';

export default class ChallengeEmailPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  resendEmailViewText() {
    if (userVariables.v3) {
      return this.form.getErrorBoxText();
    }
    return this.form.getElement(RESEND_EMAIL_VIEW_SELECTOR).innerText;
  }

  async resendEmailExists() {
    if (userVariables.v3) {
      return this.form.hasErrorBox();
    }

    const isHidden = await Selector(RESEND_EMAIL_VIEW_SELECTOR).hasClass('hide')
    return !isHidden;
  }

  resendEmailViewExists() {
    return this.form.elementExist(RESEND_EMAIL_VIEW_SELECTOR);
  }

  async clickSendAgainLink() {
    if (userVariables.v3) {
      const resendEmail = this.form.getLink('Send again');
      await this.t.click(resendEmail);
    } else {
      await this.form.clickElement('.resend-email-view a.resend-link');
    }
  }

  async clickEnterCodeLink() {
    if (userVariables.v3) {
      await this.form.clickButton('Enter a code from the email instead');
    } else {
      await this.form.clickElement('.enter-auth-code-instead-link');
    }
  }
}
import { userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const RESEND_EMAIL_VIEW_SELECTOR = '.resend-email-view';

export default class ChallengeEmailPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  resendEmailViewText() {
    if (userVariables.gen3) {
      return this.form.getErrorBoxText();
    }
    return this.form.getElement(RESEND_EMAIL_VIEW_SELECTOR).innerText;
  }

  async resendEmailExists(index = 0) {
    if (userVariables.gen3) {
      return this.form.hasAlertBox(index);
    }

    const isHidden = await this.form.getElement(RESEND_EMAIL_VIEW_SELECTOR).hasClass('hide');
    return !isHidden;
  }

  resendEmailViewExists() {
    return this.form.elementExist(RESEND_EMAIL_VIEW_SELECTOR);
  }

  async clickSendAgainLink() {
    if (userVariables.gen3) {
      const resendEmail = this.form.getLink('Send again');
      await this.t.click(resendEmail);
    } else {
      await this.form.clickElement('.resend-email-view a.resend-link');
    }
  }

  async clickEnterCodeLink() {
    await this.t.click(this.getEnterCodeInsteadButton());
  }

  getEnterCodeInsteadButton() {
    return this.form.getButton('Enter a verification code instead');
  }
}
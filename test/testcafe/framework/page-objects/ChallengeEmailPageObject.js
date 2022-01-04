import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const RESEND_EMAIL_VIEW_SELECTOR = '.resend-email-view';

export default class ChallengeEmailPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  resendEmailView() {
    return this.form.getElement(RESEND_EMAIL_VIEW_SELECTOR);
  }

  resendEmailViewExists() {
    return this.form.elementExist(RESEND_EMAIL_VIEW_SELECTOR);
  }

  async clickSendAgainLink() {
    await this.form.clickElement('.resend-email-view a.resend-link');
  }

  async clickEnterCodeLink() {
    await this.form.clickElement('.enter-auth-code-instead-link');
  }
}
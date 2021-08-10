import ChallengeFactorPageObject from './ChallengeFactorPageObject';

export default class ChallengeEmailPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  resendEmailView() {
    return this.form.getElement('.resend-email-view');
  }

  resendOVView() {
    return this.form.getElement('.resend-ov-link-view');
  }

  async clickSendAgainLink() {
    await this.form.clickElement('.resend-email-view a.resend-link');
  }

  async clickEnterCodeLink() {
    await this.form.clickElement('.enter-auth-code-instead-link');
  }
}
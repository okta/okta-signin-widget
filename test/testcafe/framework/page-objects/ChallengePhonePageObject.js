import ChallengeFactorPageObject from './ChallengeFactorPageObject';

export default class ChallengePhonePageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  elementExists(selector) {
    return this.form.elementExist(selector);
  }

  clickSecondaryLink() {
    return this.form.clickElement('.phone-authenticator-challenge__link');
  }

  resendEmailView() {
    return this.form.getElement('.phone-authenticator-challenge__resend-warning');
  }

  resendOVView() {
    return this.form.getElement('.resend-ov-link-view');
  }

  getSecondaryLinkText() {
    return this.getTextContent('.phone-authenticator-challenge__link');
  }
}
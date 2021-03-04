import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const FORM_INFOBOX_ERROR = '.o-form-error-container .infobox-error';
const RESEND_NUMBER_CHALLENGE_BUTTON = '.okta-form-infobox-warning .resend-number-challenge';
const FORM_INFOBOX_ERROR_TITLE = '.o-form-error-container .infobox-error > h3';

export default class ChallengeOktaVerifyPushPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getPushButton () {
    return this.form.getElement('.send-push');
  }

  getA11ySpan () {
    return this.form.getElement('.accessibility-text');
  }

  getResendPushButton () {
    return this.form.getElement('.button-primary');
  }

  clickResendPushButton() {
    return this.form.clickSaveButton();
  }

  clickResendNumberChallenge() {
    return this.form.clickElement(RESEND_NUMBER_CHALLENGE_BUTTON);
  }

  async waitForErrorBox() {
    await this.form.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBox () {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }

  getErrorTitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  getWarningBox () {
    return this.form.getElement(FORM_INFOBOX_WARNING);
  }

}

import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const FORM_INFOBOX_ERROR = '.o-form-error-container .infobox-error';

export default class ChallengeOktaVerifyPushPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getPushButton () {
    return this.form.getElement('.send-push');
  }

  getResendPushButton () {
    return this.form.getElement('.button-primary');
  }

  clickResendPushButton() {
    return this.form.clickSaveButton();
  }

  async waitForErrorBox() {
    await this.form.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBox () {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }

  getWarningBox () {
    return this.form.getElement(FORM_INFOBOX_WARNING);
  }

}

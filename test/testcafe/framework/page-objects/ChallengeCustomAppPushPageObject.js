import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';

export default class ChallengeCustomAppPushPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getPushButton() {
    return this.form.getElement('.send-push');
  }

  getA11ySpan() {
    return this.form.getElement('.accessibility-text');
  }

  getResendPushButton() {
    return this.form.getElement('.button-primary');
  }

  clickResendPushButton() {
    return this.form.clickSaveButton();
  }

  async waitForErrorBox() {
    await this.form.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBox() {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }

  getErrorTitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  getWarningBox() {
    return this.form.getElement(FORM_INFOBOX_WARNING);
  }

}

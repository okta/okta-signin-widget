import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const TOTP_FIELD = 'credentials.totp';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FORM_INFOBOX_ERROR_SUBTITLE = '[data-se="o-form-error-container"] [data-se="callout"] > p';
const FORM_INFOBOX_ERROR_BULLETS = '[data-se="o-form-error-container"] [data-se="callout"] > ul li';


export default class ChallengeOktaVerifyTotpPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getTotpLabel() {
    return this.form.getFormFieldLabel(TOTP_FIELD);
  }

  getAnswerInlineError() {
    return this.form.getTextBoxErrorMessage(TOTP_FIELD);
  }

  getErrorTitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  getErrorSubtitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_SUBTITLE);
  }

  getNthErrorBulletPoint(index) {
    return this.form.getElement(FORM_INFOBOX_ERROR_BULLETS).nth(index);
  }
}

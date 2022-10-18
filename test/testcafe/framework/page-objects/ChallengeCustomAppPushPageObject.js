import { Selector } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name$="autoChallenge"]';
const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name$="autoChallenge"]';
const FACTOR_BEACON = '.auth-beacon.auth-beacon-factor';
const FORM_SELECTOR = '.custom-app-send-push-form';

export default class ChallengeCustomAppPushPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
    this.beacon = new Selector('.beacon-container');
  }

  getPushButton() {
    return this.form.getElement('.send-push');
  }

  async  isCustomAppSendPushForm() {
    const formCount = await Selector(FORM_SELECTOR).count;
    return formCount === 1;
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

  async autoChallengeInputExists() {
    return this.form.elementExist(AUTO_CHALLENGE_CHECKBOX_SELECTOR);
  }

  async autoChallengeInputIsVisible() {
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_SELECTOR).visible;
  }

  getAutoChallengeCheckboxLabel() {
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  }

  async clickAutoChallengeCheckbox() {
    await this.t.click(this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR));
  }

  getBeaconClass() {
    return this.beacon.find(FACTOR_BEACON).getAttribute('class');
  }

}

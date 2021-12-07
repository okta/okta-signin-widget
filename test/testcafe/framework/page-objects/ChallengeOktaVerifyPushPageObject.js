import { Selector } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const RESEND_NUMBER_CHALLENGE_BUTTON = '.okta-form-infobox-warning .resend-number-challenge';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const SUBTITLE_SELECTOR = '[data-se="o-form-explain"]';
const FORM_SELECTOR = '.okta-verify-push-challenge';
export default class ChallengeOktaVerifyPushPageObject extends ChallengeFactorPageObject {
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

  clickResendNumberChallenge() {
    return this.form.clickElement(RESEND_NUMBER_CHALLENGE_BUTTON);
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

  subtitleExists() {
    return this.form.elementExist(SUBTITLE_SELECTOR);
  }

  async autoChallengeInputExists(selector) {
    return this.form.elementExist(selector);
  }

  getAutoChallengeCheckboxLabel(selector) {
    return this.form.getElement(selector);
  }

  async clickAutoChallengeCheckbox(selector) {
    await this.t.click(this.form.getElement(selector));
  }

  async  formWithClassExist() {
    const formCount = await Selector(FORM_SELECTOR).count;
    return formCount === 1;
  }

  async clickSendPushButton() {
    await this.t.click(this.getPushButton());
  }

}

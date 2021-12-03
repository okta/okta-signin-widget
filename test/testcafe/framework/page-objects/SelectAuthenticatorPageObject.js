import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

const factorListRowSelector = '.authenticator-list .authenticator-row';
const factorLabelSelector = `${factorListRowSelector} .authenticator-label`;
const factorDescriptionSelector = `${factorListRowSelector} .authenticator-description .authenticator-description--text`;
const factorIconSelector = `${factorListRowSelector} .authenticator-icon-container .authenticator-icon`;
const factorSelectButtonDiv = `${factorListRowSelector} .authenticator-button`;
const factorSelectButtonSelector = `${factorListRowSelector} .authenticator-button .button`;
const skipOptionalEnrollmentSelector = '.authenticator-list .skip-all';
const CUSTOM_SIGN_OUT_LINK_SELECTOR = '.auth-footer .js-cancel';
const CUSTOM_OTP_BUTTON_SELECTOR = '.authenticator-list .authenticator-row:nth-child(12) .authenticator-button a';
const IDENTIFIER_FIELD = 'identifier';
const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name="authenticator.autoChallenge"]';
const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name="authenticator.autoChallenge"]';
const SEND_PUSH_BUTTON_SELECTOR = '.send-push';
const A11Y_TEXT_SELECTOR = '.accessibility-text';
const SUBTITLE_SELECTOR = '[data-se="o-form-explain"]';
const FORM_SELECTOR = '.okta-verify-push-challenge';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getFactorsCount() {
    return this.form.getElement(factorListRowSelector).count;
  }

  getFactorLabelByIndex(index) {
    return this.form.getElement(factorLabelSelector).nth(index).textContent;
  }

  getFactorDescriptionByIndex(index) {
    return this.form.getElement(factorListRowSelector).nth(index).find(factorDescriptionSelector).textContent;
  }

  async factorDescriptionExistsByIndex(index) {
    const elCount = await this.form.getElement(factorListRowSelector).nth(index).find(factorDescriptionSelector).count;
    return elCount === 1;
  }

  getFactorIconClassByIndex(index) {
    return this.form.getElement(factorIconSelector).nth(index).getAttribute('class');
  }

  getFactorSelectButtonByIndex(index) {
    return this.form.getElement(factorSelectButtonSelector).nth(index).textContent;
  }

  getFactorSelectButtonDataSeByIndex(index) {
    return this.form.getElement(factorSelectButtonDiv).nth(index).getAttribute('data-se');
  }

  async selectFactorByIndex(index) {
    await this.t.click(this.form.getElement(factorSelectButtonSelector).nth(index));
  }

  async skipOptionalEnrollment() {
    await this.t.click(this.form.getElement(skipOptionalEnrollmentSelector));
  }

  getCustomSignOutLink() {
    return Selector(CUSTOM_SIGN_OUT_LINK_SELECTOR).getAttribute('href');
  }

  async clickCustomOTP() {
    await this.t.click(this.form.getElement(CUSTOM_OTP_BUTTON_SELECTOR));
  }

  async getErrorFromErrorBox() {
    return this.form.getErrorBoxText();
  }
  
  fillIdentifierField(value) {
    return this.form.setTextBoxValue(IDENTIFIER_FIELD, value);
  }

  getIndetifierError() {
    return this.form.getTextBoxErrorMessage(IDENTIFIER_FIELD);
  }

  async  formWithClassExist() {
    const formCount = await Selector(FORM_SELECTOR).count;
    return formCount === 1;
  }

  getA11ySpan() {
    return this.form.getElement(A11Y_TEXT_SELECTOR);
  }

  getPushButton() {
    return this.form.getElement(SEND_PUSH_BUTTON_SELECTOR);
  }

  getSubtitleElement() {
    return this.form.getElement(SUBTITLE_SELECTOR);
  }

  async autoChallengeInputExists() {
    return this.form.elementExist(AUTO_CHALLENGE_CHECKBOX_SELECTOR);
  }

  getAutoChallengeCheckboxLabel() {
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  }

  async clickAutoChallengeCheckbox() {
    await this.t.click(this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR));
  }

  async clickSendPushButton() {
    await this.t.click(this.getPushButton());
  }

}

import { Selector, userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const AUTHENTICATOR_BUTTON_SELECTOR = '[data-se="authenticator-button"]';
const AUTHENTICATOR_BUTTON_LABEL_SELECTOR = '[data-se="authenticator-button-label"]';
const AUTHENTICATOR_BUTTON_ICON_SELECTOR = '[data-se="authenticator-icon"] div';
const AUTHENTICATOR_BUTTON_CTA_BUTTON_LABEL_SELECTOR = `${AUTHENTICATOR_BUTTON_SELECTOR} [data-se="cta-button-label"]`;
const AUTHENTICATOR_BUTTON_CTA_BUTTON_SELECTOR = `${AUTHENTICATOR_BUTTON_SELECTOR} .cta-button`;
const AUTHENTICATOR_BUTTON_DESCRIPTION_SELECTOR = '[data-se="authenticator-button-description"]';
const AUTHENTICATOR_BUTTON_USAGE_TEXT_SELECTOR = '[data-se="authenticator-button-usage-text"]';
const V3_CUSTOM_OTP_BUTTON_SELECTOR = `${AUTHENTICATOR_BUTTON_SELECTOR} [data-se="custom_otp"]`;
const SKIP_OPTIONAL_ENROLLMENT_SELECTOR = '[data-type="save"]';

const factorListRowSelector = '.authenticator-list .authenticator-row';
const factorLabelSelector = `${factorListRowSelector} .authenticator-label`;
const factorDescriptionSelector = `${factorListRowSelector} .authenticator-description .authenticator-description--text`;
const factorIconSelector = `${factorListRowSelector} .authenticator-icon-container .authenticator-icon`;
const factorCustomLogoSelector = `${factorListRowSelector} .authenticator-icon-container`;
const factorSelectButtonDiv = `${factorListRowSelector} .authenticator-button`;
const factorSelectButtonSelector = `${factorListRowSelector} .authenticator-button .button`;
const factorUsageTextSelector = `${factorListRowSelector} .authenticator-usage-text`;
const skipOptionalEnrollmentSelector = '.authenticator-list .skip-all';
const CUSTOM_SIGN_OUT_LINK_SELECTOR = '.auth-footer .js-cancel';
const CUSTOM_OTP_BUTTON_SELECTOR = '.authenticator-list .authenticator-row:nth-child(12) .authenticator-button a';
const IDENTIFIER_FIELD = 'identifier';
const CUSTOM_LOGO_SELECTOR = '.custom-logo';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getFactorButton() {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_SELECTOR : factorListRowSelector;
    return this.form.getElement(selector);
  }

  getFactorsCount() {
    return this.getFactorButton().count;
  }

  getFactorLabelByIndex(index) {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_LABEL_SELECTOR : factorLabelSelector;
    return this.form.getElement(selector).nth(index).textContent;
  }

  getFactorDescriptionElementByIndex(index) {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_DESCRIPTION_SELECTOR : factorDescriptionSelector;
    return this.getFactorButton().nth(index).find(selector);
  }

  getFactorDescriptionByIndex(index) {
    return this.getFactorDescriptionElementByIndex(index).textContent;
  }

  async factorDescriptionExistsByIndex(index) {
    const elCount = await this.getFactorDescriptionElementByIndex(index).count;
    return elCount === 1;
  }

  getFactorIconClassByIndex(index) {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_ICON_SELECTOR : factorIconSelector;
    return this.form.getElement(selector).nth(index).getAttribute('class');
  }

  async factorCustomLogoExist(index) {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_ICON_SELECTOR : factorCustomLogoSelector;
    const elCount = await this.form.getElement(selector).nth(index).find(CUSTOM_LOGO_SELECTOR).count;
    return elCount === 1;
  }

  getFactorCTAButtonByIndex(index) {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_CTA_BUTTON_LABEL_SELECTOR : factorSelectButtonSelector;
    return this.form.getElement(selector).nth(index);
  }

  getFactorSelectButtonByIndex(index) {
    return this.getFactorCTAButtonByIndex(index).textContent;
  }

  getFactorSelectButtonDataSeByIndex(index) {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_CTA_BUTTON_SELECTOR : factorSelectButtonDiv;
    return this.form.getElement(selector).nth(index).getAttribute('data-se');
  }

  async selectFactorByIndex(index) {
    await this.t.click(this.getFactorCTAButtonByIndex(index));
  }

  async skipOptionalEnrollment() {
    const selector = userVariables.v3 ? SKIP_OPTIONAL_ENROLLMENT_SELECTOR : skipOptionalEnrollmentSelector;
    await this.t.click(this.form.getElement(selector));
  }

  getCustomSignOutLink() {
    return Selector(CUSTOM_SIGN_OUT_LINK_SELECTOR).getAttribute('href');
  }

  async clickCustomOTP() {
    const selector = userVariables.v3 ? V3_CUSTOM_OTP_BUTTON_SELECTOR : CUSTOM_OTP_BUTTON_SELECTOR;
    await this.t.click(this.form.getElement(selector));
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

  getFactorUsageTextElementByIndex(index) {
    const selector = userVariables.v3 ? AUTHENTICATOR_BUTTON_USAGE_TEXT_SELECTOR : factorUsageTextSelector;
    return this.getFactorButton().nth(index).find(selector);
  }

  getFactorUsageTextByIndex(index) {
    return this.getFactorUsageTextElementByIndex(index).textContent;
  }

  async factorUsageTextExistsByIndex(index) {
    const elCount = await this.getFactorUsageTextElementByIndex(index).count;
    return elCount === 1;
  }
}

import { Selector, userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const factorListRowSelector = userVariables.v3 ? '.authenticator-row' : '.authenticator-list .authenticator-row';
const factorLabelSelector = `${factorListRowSelector} .authenticator-label`;
const factorDescriptionSelector = `${factorListRowSelector} .authenticator-description .authenticator-description--text`;
const factorIconSelector = `${factorListRowSelector} .authenticator-icon-container .authenticator-icon`;
const factorCustomLogoSelector = `${factorListRowSelector} .authenticator-icon-container`;
const factorSelectButtonDiv = `${factorListRowSelector} .authenticator-button`;
const factorSelectButtonSelector = `${factorListRowSelector} .authenticator-button .button`;
const factorUsageTextSelector = `${factorListRowSelector} .authenticator-usage-text`;
const CUSTOM_SIGN_OUT_LINK_SELECTOR = '.auth-footer .js-cancel';
const CUSTOM_OTP_BUTTON_SELECTOR = '.authenticator-list .authenticator-row:nth-child(12) .authenticator-button a';
const IDENTIFIER_FIELD = 'identifier';
const CUSTOM_LOGO_SELECTOR = '.custom-logo';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getFactorButton() {
    return this.form.getElement(factorListRowSelector);
  }

  getFactorsCount() {
    return this.getFactorButton().count;
  }

  getFactorLabelByIndex(index) {
    return this.form.getElement(factorLabelSelector).nth(index).textContent;
  }

  getFactorDescriptionElementByIndex(index) {
    return this.getFactorButton().nth(index).find(factorDescriptionSelector);
  }

  getFactorDescriptionByIndex(index) {
    return this.getFactorDescriptionElementByIndex(index).textContent;
  }

  async factorDescriptionExistsByIndex(index) {
    const elCount = await this.getFactorDescriptionElementByIndex(index).count;
    return elCount === 1;
  }

  getFactorIconClassByIndex(index) {
    return this.form.getElement(factorIconSelector).nth(index).getAttribute('class');
  }

  async factorCustomLogoExist(index) {
    const elCount = await this.form.getElement(factorCustomLogoSelector).nth(index).find(CUSTOM_LOGO_SELECTOR).count;
    return elCount === 1;
  }

  getFactorCTAButtonByIndex(index) {
    return this.form.getElement(factorSelectButtonSelector).nth(index);
  }

  getFactorSelectButtonByIndex(index) {
    return this.getFactorCTAButtonByIndex(index).textContent;
  }

  getFactorSelectButtonDataSeByIndex(index) {
    return this.form.getElement(factorSelectButtonDiv).nth(index).getAttribute('data-se');
  }

  async selectFactorByIndex(index) {
    await this.t.click(this.getFactorCTAButtonByIndex(index));
  }

  async skipOptionalEnrollment() {
    const button = this.form.getButtonByName('Set up later');
    await this.t.click(button);
  }

  getCustomSignOutLink() {
    return Selector(CUSTOM_SIGN_OUT_LINK_SELECTOR).getAttribute('href');
  }

  async clickCustomOTP() {
    if (userVariables.v3) {
      const button = this.form.getButtonByName('Atko Custom OTP Authenticator');
      await this.t.click(button);
    } else {
      await this.t.click(this.form.getElement(CUSTOM_OTP_BUTTON_SELECTOR));
    }
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
    return this.getFactorButton().nth(index).find(factorUsageTextSelector);
  }

  getFactorUsageTextByIndex(index) {
    return this.getFactorUsageTextElementByIndex(index).textContent;
  }

  async factorUsageTextExistsByIndex(index) {
    const elCount = await this.getFactorUsageTextElementByIndex(index).count;
    return elCount === 1;
  }
}

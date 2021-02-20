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

}

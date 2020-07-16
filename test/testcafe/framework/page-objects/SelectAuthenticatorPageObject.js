import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

const factorListRowSelector = '.authenticator-list .authenticator-row';
const factorLabelSelector = `${factorListRowSelector} .authenticator-label`;
const factorDescriptionSelector = `${factorListRowSelector} .authenticator-description .authenticator-description--text`;
const factorIconSelector = `${factorListRowSelector} .authenticator-icon-container .authenticator-icon`;
const factorSelectButtonSelector = `${factorListRowSelector} .authenticator-button .button`;
const skipOptionalEnrollmentSelector = `.authenticator-list .skip-all`;
const CUSTOM_SIGN_OUT_LINK_SELECTOR = '.auth-footer .js-cancel';

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

  getFactorIconClassByIndex(index) {
    return this.form.getElement(factorIconSelector).nth(index).getAttribute('class');
  }

  getFactorSelectButtonByIndex(index) {
    return this.form.getElement(factorSelectButtonSelector).nth(index).textContent;
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

}

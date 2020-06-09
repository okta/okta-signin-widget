import BasePageObject from './BasePageObject';

const factorListRowSelector = '.authenticator-list .enroll-factor-row';
const factorLabelSelector = `${factorListRowSelector} .authenticator-label`;
const factorDescriptionSelector = `${factorListRowSelector} .factor-description .authenticator-label`;
const factorIconSelector = `${factorListRowSelector} .enroll-factor-icon-container .factor-icon`;
const factorSelectButtonSelector = `${factorListRowSelector} .authenticator-button .button`;
const skipOptionalEnrollmentSelector = `.authenticator-list .skip-all`;

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

  /**
   * shall be more explicit at checking factor label and icon.
   * @deprecated
   */
  hasPasswordSelectButton() {
    return this.form.elementExist('.enroll-factor-row > .enroll-factor-description > .enroll-factor-button');
  }

  /**
  * @deprecated
  */
  async selectPasswordFactor() {
    await this.form.clickElement('.enroll-factor-row > .enroll-factor-description > .enroll-factor-button');
  }

  /**
  * @deprecated
  */
  hasPasswordIcon() {
    return this.form.elementExist('.enroll-factor-row > .enroll-factor-icon-container > .mfa-okta-password');
  }

  /**
  * @deprecated
  */
  hasEmailIcon() {
    return this.form.elementExist('.enroll-factor-row > .enroll-factor-icon-container > .mfa-okta-email');
  }

  /**
   * @deprecated
   */
  getPasswordLabel() {
    return this.form.getElement('.enroll-factor-row:first-child > .enroll-factor-description > .enroll-factor-label').textContent;
  }

  /**
  * @deprecated
  */
  getEmailLabel() {
    return this.form.getElement('.enroll-factor-row:last-child > .enroll-factor-description > .enroll-factor-label').textContent;
  }

}

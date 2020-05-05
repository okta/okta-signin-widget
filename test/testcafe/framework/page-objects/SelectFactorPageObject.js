import BasePageObject from './BasePageObject';

const buttonSelector = '.enroll-factor-list .enroll-factor-row .enroll-factor-button .button';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getFactorsCount() {
    return this.form.getElement('.enroll-factor-list .enroll-factor-row').count;
  }

  getFactorLabelByIndex(index) {
    return this.form.getElement('.enroll-factor-list .enroll-factor-row .enroll-factor-label').nth(index).textContent;
  }

  getFactorIconClassByIndex(index) {
    return this.form.getElement('.enroll-factor-list .enroll-factor-icon-container .factor-icon').nth(index).getAttribute('class');
  }

  getFactorSelectButtonByIndex(index) {
    return this.form.getElement(buttonSelector).nth(index).textContent;
  }

  async selectFactorByIndex(index) {
    await this.t.click(this.form.getElement(buttonSelector).nth(index));
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

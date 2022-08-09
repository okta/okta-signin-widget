import { Selector } from 'testcafe';
import BaseFormObjectV3 from './components/BaseFormObjectV3';
import SelectFactorPageObject from './SelectFactorPageObject';

const SIGNOUT_LINK = '[data-se="cancel"]';
const AUTHENTICATOR_BUTTON_SELECTOR = '[data-se="authenticator-button"]';
const AUTHENTICATOR_BUTTON_LABEL_SELECTOR = '[data-se="authenticator-button-label"]';
const AUTHENTICATOR_BUTTON_DESCRIPTION_SELECTOR = '[data-se="authenticator-button-description"]';
const AUTHENTICATOR_BUTTON_USAGE_TEXT_SELECTOR = '[data-se="authenticator-button-usage-text"]';
const AUTHENTICATOR_BUTTON_ICON_SELECTOR = '[data-se="authenticator-icon"] div';
const AUTHENTICATOR_BUTTON_CTA_BUTTON_SELECTOR = `${AUTHENTICATOR_BUTTON_SELECTOR} .cta-button`;
const AUTHENTICATOR_BUTTON_CTA_BUTTON_LABEL_SELECTOR = `${AUTHENTICATOR_BUTTON_SELECTOR} [data-se="cta-button-label"]`;
const CUSTOM_OTP_BUTTON_SELECTOR = `${AUTHENTICATOR_BUTTON_SELECTOR} [data-se="custom_otp"]`;
const SKIP_OPTIONAL_ENROLLMENT_SELECTOR = '[data-type="save"]';

export default class SelectFactorPageObjectV3 extends SelectFactorPageObject {
  constructor(t) {
    super(t);
    // override super.form
    this.form = new BaseFormObjectV3(t);
  }

  getFactorsCount() {
    return this.form.getElement(AUTHENTICATOR_BUTTON_SELECTOR).count;
  }

  getFactorLabelByIndex(index) {
    return this.form.getElement(AUTHENTICATOR_BUTTON_LABEL_SELECTOR).nth(index).textContent;
  }

  getFactorIconClassByIndex(index) {
    return this.form.getElement(AUTHENTICATOR_BUTTON_ICON_SELECTOR).nth(index).getAttribute('class');
  }

  getFactorSelectButtonByIndex(index) {
    return this.form.getElement(AUTHENTICATOR_BUTTON_CTA_BUTTON_LABEL_SELECTOR).nth(index).textContent;
  }

  getFactorSelectButtonDataSeByIndex(index) {
    return this.form.getElement(AUTHENTICATOR_BUTTON_CTA_BUTTON_SELECTOR).nth(index).getAttribute('data-se');
  }

  getFactorDescriptionByIndex(index) {
    return this.form.getElement(AUTHENTICATOR_BUTTON_DESCRIPTION_SELECTOR).nth(index).textContent;
  }

  getFactorUsageTextByIndex(index) {
    return this.form.getElement(AUTHENTICATOR_BUTTON_USAGE_TEXT_SELECTOR).nth(index).textContent;
  }

  async getErrorFromErrorBox() {
    return this.form.getErrorBoxText();
  }

  async clickCustomOTP() {
    await this.t.click(this.form.getElement(CUSTOM_OTP_BUTTON_SELECTOR));
  }

  async skipOptionalEnrollment() {
    await this.t.click(this.form.getElement(SKIP_OPTIONAL_ENROLLMENT_SELECTOR));
  }

  async selectFactorByIndex(index) {
    await this.t.click(this.form.getElement(AUTHENTICATOR_BUTTON_SELECTOR).nth(index));
  }

  async factorUsageTextExistsByIndex(index) {
    const elCount = await this.form.getElement(AUTHENTICATOR_BUTTON_USAGE_TEXT_SELECTOR).nth(index).count;
    return elCount === 1;
  }

  async signoutLinkExists() {
    const elCount = await Selector(SIGNOUT_LINK).count;
    return elCount === 1;
  }
}

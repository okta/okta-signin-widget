import { Selector, userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';
import BasePageObject from './BasePageObject';

const factorListRowSelector = userVariables.gen3 ? '[data-se="authenticator-button"]' : '.authenticator-list .authenticator-row';
const factorLabelSelector = userVariables.gen3 
  ? `${factorListRowSelector} [data-se="authenticator-button-content"] p[data-se="authenticator-button-label"]` 
  : `${factorListRowSelector} .authenticator-label`;
const factorDescriptionSelector = userVariables.gen3
  ? `${factorListRowSelector} [data-se="authenticator-button-description"]`
  : `${factorListRowSelector} .authenticator-description .authenticator-description--text`;
const factorNicknameSelector = userVariables.gen3
  ? `${factorListRowSelector} [data-se="authenticator-button-nickname"]`
  : `${factorListRowSelector} .authenticator-enrollment-nickname`;
const factorIconSelector = userVariables.gen3
  ? `${factorListRowSelector} [data-se="authenticator-icon"] [data-se~="factor-beacon"]`
  : `${factorListRowSelector} .authenticator-icon-container .authenticator-icon`;
const factorCustomLogoSelector = userVariables.gen3
  ? `${factorListRowSelector} [data-se="authenticator-icon"]`
  : `${factorListRowSelector} .authenticator-icon-container`;
const factorSelectForVerificationButtonDiv = userVariables.gen3
  ? `${factorListRowSelector} > div:last-child`
  : `${factorListRowSelector} .authenticator-button`;
const factorSelectForEnrollButtonDiv = userVariables.gen3
  ? `${factorListRowSelector} [data-se="authenticator-button-content"] > div:last-child`
  : `${factorListRowSelector} .authenticator-button`;
const factorSelectButtonSelector = userVariables.gen3
  ? `${factorListRowSelector} [data-se="cta-button-icon"]`
  : `${factorListRowSelector} .authenticator-button .button`;
const factorUsageTextSelector = userVariables.gen3
  ? `${factorListRowSelector} [data-se="authenticator-button-usage-text"]`
  : `${factorListRowSelector} .authenticator-usage-text`;
const authenticatorGracePeriodRequiredDescriptionSelector = userVariables.gen3
  ? '[data-se="authenticator-grace-period-required-description"]'
  : '.authenticator-grace-period-required-description';
const authenticatorGracePeriodExpirySelector = userVariables.gen3
  ? '[data-se="authenticator-grace-period-expiry-date"]'
  : '.authenticator-grace-period-expiry-date';
const authenticatorGracePeriodRemainingSkipsDescriptionSelector = userVariables.gen3
  ? '[data-se="authenticator-grace-period-skip-count-description"]'
  : '.authenticator-grace-period-skip-count-description';
const authenticatorListTitleSelector = userVariables.gen3 
  ? '[data-se="authenticator-list-title"]'
  : '.authenticator-list .authenticator-list-title';
const skipOptionalEnrollmentSelector = userVariables.gen3
  ? '[data-se="save"]'
  : '.authenticator-enroll-list-container .skip-all';
const CUSTOM_SIGN_OUT_LINK_SELECTOR = userVariables.gen3 ? '[data-se="cancel"]' : '.auth-footer .js-cancel';
const CUSTOM_OTP_BUTTON_SELECTOR = '.authenticator-list .authenticator-row:nth-child(12) .authenticator-button a';
const IDENTIFIER_FIELD = 'identifier';
const CUSTOM_LOGO_SELECTOR = userVariables.gen3 ? '[data-se="custom-logo"]' : '.custom-logo';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getFactorButtons() {
    if (userVariables.gen3) {
      return this.form.getAllButtons().withAttribute('data-se', 'authenticator-button');
    }
    return this.form.getElement(factorListRowSelector);
  }

  getFactorsCount() {
    return this.getFactorButtons().count;
  }

  getFactorLabelByIndex(index) {
    if (userVariables.gen3) {
      const factorButton = this.getFactorButtons().nth(index);
      return within(factorButton).find(factorLabelSelector).textContent;
    }
    return this.form.getElement(factorLabelSelector).nth(index).textContent;
  }

  getFactorDescriptionElementByIndex(index) {
    return this.getFactorButtons().nth(index).find(factorDescriptionSelector);
  }

  getFactorDescriptionByIndex(index) {
    return this.getFactorDescriptionElementByIndex(index).textContent;
  }

  getFactorNicknameElementByIndex(index) {
    return this.getFactorButtons().nth(index).find(factorNicknameSelector);
  }

  getFactorNicknameByIndex(index) {
    return this.getFactorNicknameElementByIndex(index).textContent;
  }

  getFactorButtonAriaLabelByIndex(index) {
    if (userVariables.gen3) {
      const factorButton = this.getFactorButtons().nth(index);
      return factorButton.getAttribute('aria-label');
    }
    return this.getFactorCTAButtonByIndex(index).getAttribute('aria-label');
  }

  getFactorAriaDescriptionByIndex(index) {
    return this.getAriaDescription(this.getFactorButtons().nth(index));
  }

  async factorDescriptionExistsByIndex(index) {
    const elCount = await this.getFactorDescriptionElementByIndex(index).count;
    return elCount === 1;
  }

  async factorNicknameExistsByIndex(index) {
    const elCount = await this.getFactorNicknameElementByIndex(index).count;
    return elCount === 1;
  }

  async factorNicknameDoesNotExistByIndex(index) {
    const elCount = await this.getFactorNicknameElementByIndex(index).count;
    return elCount === 0;
  }

  getFactorIconSelectorByIndex(index) {
    if (userVariables.gen3) {
      return this.form.getElement(factorIconSelector).nth(index).getAttribute('data-se');      
    }
    return this.form.getElement(factorIconSelector).nth(index).getAttribute('class');
  }

  getFactorIconBgImageByIndex(index) {
    if (userVariables.gen3) {
      return within(this.form.getElement(factorIconSelector).nth(index)).queryByRole('img', { hidden: true }).getAttribute('src');
    }
    return this.form.getElement(factorIconSelector).nth(index).getStyleProperty('background-image');
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

  getFactorSelectButtonDataSeByIndex(index, forEnroll = false) {
    return this.form.getElement(
      forEnroll ? factorSelectForEnrollButtonDiv : factorSelectForVerificationButtonDiv
    ).nth(index).getAttribute('data-se');
  }

  async selectFactorByIndex(index) {
    await this.t.click(this.getFactorCTAButtonByIndex(index));
  }

  async clickSetUpLaterButton() {
    if (userVariables.gen3) {
      // 'Set up later' button was renamed to improve UX in OKTA-549620
      const button = this.form.getButton('Continue');
      await this.t.click(button);
      return;
    }
    await this.t.click(this.form.getElement(skipOptionalEnrollmentSelector));
  }

  getCustomSignOutLink() {
    return Selector(CUSTOM_SIGN_OUT_LINK_SELECTOR).getAttribute('href');
  }

  async clickCustomOTP() {
    if (userVariables.gen3) {
      const button = this.form.getButton('Set up Atko Custom OTP Authenticator.');
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

  getIdentifierError() {
    return this.form.getTextBoxErrorMessage(IDENTIFIER_FIELD);
  }

  getFactorUsageTextElementByIndex(index) {
    return this.getFactorButtons().nth(index).find(factorUsageTextSelector);
  }

  getFactorUsageTextByIndex(index) {
    return this.getFactorUsageTextElementByIndex(index).textContent;
  }

  async factorUsageTextExistsByIndex(index) {
    const elCount = await this.getFactorUsageTextElementByIndex(index).count;
    return elCount === 1;
  }

  getFactorGracePeriodRemainingSkipsDescriptionTextByIndex(index) {
    return this.getFactorButtons().nth(index).find(authenticatorGracePeriodRemainingSkipsDescriptionSelector).textContent;
  }

  getFactorGracePeriodRequiredDescriptionTextByIndex(index) {
    return this.getFactorButtons().nth(index).find(authenticatorGracePeriodRequiredDescriptionSelector).textContent;
  }

  async factorGracePeriodRequiredDescriptionExistsByIndex(index) {
    const elCount = await this.getFactorButtons().nth(index).find(authenticatorGracePeriodRequiredDescriptionSelector).count;
    return elCount === 1;
  }

  getFactorGracePeriodExpiryTextByIndex(index) {
    return this.getFactorButtons().nth(index).find(authenticatorGracePeriodExpirySelector).textContent;
  }

  async factorGracePeriodExpiryExistsByIndex(index) {
    const elCount = await this.getFactorButtons().nth(index).find(authenticatorGracePeriodExpirySelector).count;
    return elCount === 1;
  }

  getAuthenticatorListTitleTextByIndex(index) {
    return this.form.getElement(authenticatorListTitleSelector).nth(index).textContent;
  }

  async skipButtonExists() {
    const elCount = await this.form.getElement(skipOptionalEnrollmentSelector).count;
    return elCount === 1;
  }

  getNextButton() {
    return this.form.getButton('Next');
  }

  async goToNextPage() {
    return this.form.clickButton('Next');
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getErrorBoxText() {
    return this.form.getErrorBoxText();
  }
}

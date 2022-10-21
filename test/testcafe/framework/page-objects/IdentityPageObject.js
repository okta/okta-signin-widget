import { Selector, userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const CALLOUT_SELECTOR = '[data-se="callout"]';
const ENROLL_SELECTOR = 'a[data-se="enroll"]';
const NEEDHELP_SELECTOR = 'a[data-se="help"]';
const FORGOT_PASSWORD_SELECTOR = 'a[data-se="forgot-password"]';
const CUSTOM_HELP_LINK_SELECTOR = '.auth-footer .js-help';
const CUSTOM_HELP_LINKS_SELECTOR = '.auth-footer .js-custom';
const CUSTOM_BUTTON = '.custom-buttons .okta-custom-buttons-container .default-custom-button';
const UNLOCK_ACCOUNT = '.auth-footer .js-unlock';
const SUB_LABEL_SELECTOR = '.o-form-explain';
const IDPS_CONTAINER = '.okta-idps-container';
const FOOTER_INFO_SELECTOR = '.footer-info';
const CUSTOM_IDP_BUTTON = '.social-auth-general-idp-button';

export default class IdentityPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  /**
   * @deprecated
   * @see BasePageObject.getFormTitle
   */
  getPageTitle() {
    return this.getFormTitle();
  }

  getOktaVerifyButtonText() {
    return this.form.getElement('.sign-in-with-device-option .okta-verify-container .link-button').textContent;
  }

  getRememberMeCheckbox() {
    return this.form.getCheckbox('Keep me signed in');
  }

  getRememberMeValue() {
    return this.getRememberMeCheckbox().checked;
  }

  checkRememberMe() {
    return this.form.setCheckbox('Keep me signed in', true, true);
  }

  getSignupLinkText() {
    return Selector(ENROLL_SELECTOR).textContent;
  }

  getNeedhelpLinkText() {
    return Selector(NEEDHELP_SELECTOR).textContent;
  }

  getForgotPasswordLinkText() {
    return Selector(FORGOT_PASSWORD_SELECTOR).textContent;
  }

  async hasForgotPasswordLinkText() {
    const elCount = await Selector(FORGOT_PASSWORD_SELECTOR).count;
    return elCount === 1;
  }

  async clickOktaVerifyButton() {
    await this.t.click(Selector('.sign-in-with-device-option .okta-verify-container .link-button'));
  }

  getSeparationLineText() {
    return this.form.getElement('.sign-in-with-device-option .separation-line').textContent;
  }

  fillIdentifierField(value) {
    return this.form.setTextBoxValue('Username', value, true);
  }

  getIdentifierValue() {
    return this.form.getTextBoxValue('Username', true);
  }

  fillPasswordField(value) {
    return this.form.setTextBoxValue('credentials.passcode', value);
  }

  async hasShowTogglePasswordIcon() {
    return await Selector('.password-toggle').count;
  }

  getNextButton() {
    return this.form.getButton('Next');
  }

  getSaveButtonLabel() {
    return this.form.getSaveButtonLabel();
  }

  clickNextButton() {
    return this.form.clickSaveButton('Next');
  }

  clickVerifyButton() {
    return this.form.clickSaveButton('Verify');
  }

  clickSignInButton() {
    return this.form.clickSaveButton('Sign in');
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getGlobalErrors() {
    return this.form.getErrorBoxText();
  }

  getTotalGlobalErrors() {
    return this.form.getErrorBoxCount();
  }

  waitForIdentifierError() {
    return this.form.waitForTextBoxError('identifier');
  }

  hasIdentifierErrorMessage() {
    return this.form.hasTextBoxErrorMessage('identifier');
  }

  getIdentifierErrorMessage() {
    return this.form.getTextBoxErrorMessage('identifier');
  }

  /**
   * @deprecated
   * @see hasPasswordErrorMessage
   */
  hasPasswordError() {
    return this.form.hasTextBoxError('credentials\\.passcode');
  }

  hasPasswordErrorMessage() {
    return this.form.hasTextBoxErrorMessage('credentials\\.passcode');
  }

  getPasswordErrorMessage() {
    return this.form.getTextBoxErrorMessage('credentials\\.passcode');
  }

  hasCallout() {
    return !this.form.getCallout(CALLOUT_SELECTOR);
  }

  hasUnknownUserErrorCallout() {
    if(userVariables.v3) {
      return this.form.hasErrorBox();
    }
    return this.form.getCallout(CALLOUT_SELECTOR).hasClass('infobox-error');
  }

  getUnknownUserCalloutContent() {
    return this.form.getErrorBoxText();
  }

  getIdpButton(selector) {
    return this.form.getCallout(selector);
  }

  clickIdpButton(selector) {
    return this.form.clickElement(selector);
  }

  identifierFieldExists(selector) {
    return this.form.elementExist(selector);
  }

  getCustomForgotPasswordLink() {
    return Selector(FORGOT_PASSWORD_SELECTOR).getAttribute('href');
  }

  getCustomHelpLink() {
    return Selector(CUSTOM_HELP_LINK_SELECTOR).getAttribute('href');
  }

  getCustomHelpLinks(index) {
    return Selector(CUSTOM_HELP_LINKS_SELECTOR).nth(index).getAttribute('href');
  }

  getCustomHelpLinksLabel(index) {
    return Selector(CUSTOM_HELP_LINKS_SELECTOR).nth(index).textContent;
  }

  getFooterInfo() {
    return Selector(FOOTER_INFO_SELECTOR).textContent;
  }

  async clickCustomButtonLink(index) {
    await this.t.click(Selector(CUSTOM_BUTTON).nth(index));
  }

  getCustomButtonText(index) {
    return Selector(CUSTOM_BUTTON).nth(index).textContent;
  }

  async clickSignUpLink() {
    await this.t.click(Selector(ENROLL_SELECTOR));
  }

  getUnlockAccountLink() {
    if(userVariables.v3) {
      return this.form.getLink('Unlock account?');
    }
    return Selector(UNLOCK_ACCOUNT);
  }

  getUnlockAccountLinkText() {
    return this.getUnlockAccountLink().textContent;
  }

  async clickUnlockAccountLink() {
    await this.t.click(this.getUnlockAccountLink());
  }

  getCustomUnlockAccountLinkUrl() {
    return this.getUnlockAccountLink().getAttribute('href');
  }

  getIdentifierSubLabelValue() {
    return Selector(SUB_LABEL_SELECTOR).nth(0).textContent;
  }

  getPasswordSubLabelValue() {
    return Selector(SUB_LABEL_SELECTOR).nth(1).textContent;
  }

  getIdpsContainer() {
    return Selector(IDPS_CONTAINER);
  }

  getCustomIdpButtonLabel(index) {
    return Selector(CUSTOM_IDP_BUTTON).nth(index).textContent;
  }
}

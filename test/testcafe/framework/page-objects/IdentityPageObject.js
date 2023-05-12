import { Selector, userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

import BasePageObject from './BasePageObject';

const CALLOUT_SELECTOR = '[data-se="callout"]';
const NEEDHELP_SELECTOR = 'a[data-se="help"]';
const FORGOT_PASSWORD_SELECTOR = '[data-se="forgot-password"]';
const CUSTOM_HELP_LINK_SELECTOR = userVariables.v3 ? '[data-se="help"]' : '.auth-footer .js-help';
const CUSTOM_HELP_LINKS_SELECTOR = userVariables.v3 ? '[data-se="custom"]' : '.auth-footer .js-custom';
const CUSTOM_BUTTON = '.custom-buttons .okta-custom-buttons-container .default-custom-button';
const SUB_LABEL_SELECTOR = '.o-form-explain';
const IDPS_CONTAINER = '.okta-idps-container';
const FOOTER_INFO_SELECTOR = '.footer-info';

export default class IdentityPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getOktaVerifyButtonText() {
    if (userVariables.v3) {
      return this.form.getButton(/Sign in with Okta FastPass/).textContent;
    }
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
    return this.form.getLink('Sign up').textContent;
  }

  getNeedhelpLinkText() {
    return Selector(NEEDHELP_SELECTOR).textContent;
  }

  async hasForgotPasswordLinkText() {
    return this.form.getLink('Forgot password?').exists;
  }

  async clickOktaVerifyButton() {
    if (userVariables.v3) {
      await this.form.clickButton(/Sign in with Okta FastPass/);
    } else {
      await this.t.click(Selector('.sign-in-with-device-option .okta-verify-container .link-button'));
    }
  }

  async clickPivButton() {
    if (userVariables.v3) {
      await this.form.clickButton('Sign in with PIV / CAC card');
    } else {
      await this.t.click(this.form.getLink('Sign in with PIV / CAC card'));
    }
  }

  getSeparationLineText() {
    if (userVariables.v3) {
      return this.form.getElement('[role="separator"]').textContent;  
    }
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
    if (userVariables.v3) {
      return await this.form.getButton('Show password').exists;
    }
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

  async waitForSocialAuthButtons() {
    return await Selector('.social-auth-button').visible;
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
      return this.form.hasAlertBox();
    }
    return this.form.getCallout(CALLOUT_SELECTOR).hasClass('infobox-error');
  }

  getUnknownUserCalloutContent() {
    return this.form.getErrorBoxText();
  }

  getIdpButton(name) {
    if(userVariables.v3) {
      return this.form.getButton(name);
    }
    
    return this.form.getLink(name);
  }

  clickIdpButton(name) {
    if (userVariables.v3) {
      return this.form.clickButton(name);
    }
    return this.t.click(this.form.getLink(name));
  }

  identifierFieldExists(selector) {
    return this.form.elementExist(selector);
  }

  identifierFieldExistsForPIVView() {
    return this.form.fieldByLabelExists('Username');
  }

  identifierFieldExistsForIdpView() {
    return this.form.fieldByLabelExists('Username');
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

  getCustomHelpLinksTarget(index) {
    return Selector(CUSTOM_HELP_LINKS_SELECTOR).nth(index).getAttribute('target');
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
    await this.t.click(this.form.getLink('Sign up'));
  }

  getUnlockAccountLink(name = 'Unlock account?') {
    return this.form.getLink(name);
  }

  unlockAccountLinkExists(name = 'Unlock account?') {
    return this.getUnlockAccountLink(name).exists;
  }

  getUnlockAccountLinkText() {
    return this.getUnlockAccountLink().textContent;
  }

  async clickUnlockAccountLink() {
    await this.t.click(this.getUnlockAccountLink());
  }

  getCustomUnlockAccountLinkUrl(name) {
    return this.getUnlockAccountLink(name).getAttribute('href');
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

  getIdpButtonCount() {
    if (userVariables.v3) {
      return within(this.form.el).getAllByRole('button', { name: /Sign in with/}).count;
    }
    return this.getIdpsContainer().childElementCount;
  }
}

import { Selector, userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

import BasePageObject from './BasePageObject';

const CALLOUT_SELECTOR = '[data-se="callout"]';
const NEEDHELP_SELECTOR = 'a[data-se="help"]';
const FORGOT_PASSWORD_SELECTOR = '[data-se="forgot-password"]';
const CUSTOM_HELP_LINKS_SELECTOR = '.auth-footer .js-custom';
const CUSTOM_BUTTON = userVariables.gen3 ? '[data-se="custom-button"]' : '.custom-buttons .okta-custom-buttons-container .default-custom-button';
const SUB_LABEL_SELECTOR = '.o-form-explain';
const IDPS_CONTAINER = '.okta-idps-container';
const FOOTER_INFO_SELECTOR = userVariables.gen3 ? '[data-se="signup-info"]' : '.footer-info';
const SOCIAL_AUTH_BUTTON = userVariables.gen3 ? '[data-se="piv-card-button"]' : '.social-auth-button';

export default class IdentityPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getOktaVerifyButtonText() {
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      await this.form.clickButton(/Sign in with Okta FastPass/);
    } else {
      await this.t.click(Selector('.sign-in-with-device-option .okta-verify-container .link-button'));
    }
  }

  async clickPivButton() {
    if (userVariables.gen3) {
      await this.form.clickButton('Sign in with PIV / CAC card');
    } else {
      await this.t.click(this.form.getLink('Sign in with PIV / CAC card'));
    }
  }

  getSeparationLineText() {
    if (userVariables.gen3) {
      return this.form.getElement('[role="separator"]').textContent;
    }
    return this.form.getElement('.sign-in-with-device-option .separation-line').textContent;
  }

  fillIdentifierField(value) {
    return this.form.setTextBoxValue('Username', value, true);
  }

  getIdentifierValue() {
    return this.form.getTextBoxValue(/Username/, true);
  }

  fillPasswordField(value) {
    return this.form.setTextBoxValue('credentials.passcode', value);
  }

  async hasShowTogglePasswordIcon() {
    if (userVariables.gen3) {
      return await this.form.queryButton('Show password').exists;
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

  isNextButtonDisabled() {
    return this.form.isSaveButtonDisabled('Next');
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
    return await Selector(SOCIAL_AUTH_BUTTON).visible;
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
    if(userVariables.gen3) {
      return this.form.hasAlertBox();
    }
    return this.form.getCallout(CALLOUT_SELECTOR).hasClass('infobox-error');
  }

  getUnknownUserCalloutContent() {
    return this.form.getErrorBoxText();
  }

  getIdpButton(name) {
    if(userVariables.gen3) {
      return this.form.getButton(name);
    }

    return this.form.getLink(name);
  }

  clickIdpButton(name) {
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      return this.form.getLink('Forgot password?');
    }
    return Selector(FORGOT_PASSWORD_SELECTOR);
  }

  getCustomForgotPasswordLinkUrl() {
    return this.getCustomForgotPasswordLink().getAttribute('href');
  }

  getHelpLinkUrl() {
    return this.getHelpLink().getAttribute('href');
  }

  getCustomHelpLink(index, name) {
    if (userVariables.gen3) {
      return this.form.getLink(name);
    }
    return Selector(CUSTOM_HELP_LINKS_SELECTOR).nth(index);
  }

  getCustomHelpLinkUrl(index, name) {
    return this.getCustomHelpLink(index, name).getAttribute('href');
  }

  getCustomHelpLinkTarget(index, name) {
    return this.getCustomHelpLink(index, name).getAttribute('target');
  }

  getCustomHelpLinkRel(index, name) {
    return this.getCustomHelpLink(index, name).getAttribute('rel');
  }

  getCustomHelpLinkLabel(index, name) {
    return this.getCustomHelpLink(index, name).textContent;
  }

  getFooterInfo() {
    return Selector(FOOTER_INFO_SELECTOR).textContent;
  }

  getCustomButton(index) {
    return Selector(CUSTOM_BUTTON).nth(index);
  }

  async clickCustomButtonLink(index) {
    await this.t.click(this.getCustomButton(index));
  }

  getCustomButtonText(index) {
    return this.getCustomButton(index).textContent;
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
    if (userVariables.gen3) {
      return Selector('#identifier-hint').textContent;
    }
    return Selector(SUB_LABEL_SELECTOR).nth(0).textContent;
  }

  getPasswordSubLabelValue() {
    if (userVariables.gen3) {
      return Selector('#credentials\\.passcode-hint').textContent;
    }
    return Selector(SUB_LABEL_SELECTOR).nth(1).textContent;
  }

  getIdpsContainer() {
    return Selector(IDPS_CONTAINER);
  }

  getIdpButtonCount() {
    if (userVariables.gen3) {
      return within(this.form.el).getAllByRole('button', { name: /Sign in with/}).count;
    }
    return this.getIdpsContainer().childElementCount;
  }

  async clickShowPasswordIcon() {
    if (userVariables.gen3) {
      const pwToggleBtn = within(this.form.el).getAllByRole('button', { name: 'Show password' }).nth(0);
      await this.t.click(pwToggleBtn);
      return;
    }
    await this.t.click(Selector('.password-toggle .button-show'));
  }

  getTextField(label) {
    return this.form.getTextBox(label, true);
  }
}

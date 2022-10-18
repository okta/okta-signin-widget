import BasePageObject from './BasePageObject';

const passwordFieldName = 'credentials\\.passcode';
const confirmPasswordFieldName = 'confirmPassword';
const requirementsSelector = '[data-se="password-authenticator--rules"]';

/**
 * This page object will be used by 
 * password enrollment
 * password expiry
 * password will expire soon 
 * admin initiated password reset scenarios.
 * 
 * TODO: Rename this to have AuthenticatorPasswordPageObject when Factor is cleaned up.
 */
export default class EnrollPasswordPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  passwordFieldExists() {
    return this.form.elementExist(`input[name="${passwordFieldName}"]`);
  }

  confirmPasswordFieldExists() {
    return this.form.elementExist(`input[name="${confirmPasswordFieldName}"]`);
  }

  fillPassword(value) {
    return this.form.setTextBoxValue(passwordFieldName, value);
  }

  fillConfirmPassword(value) {
    return this.form.setTextBoxValue(confirmPasswordFieldName, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  hasPasswordError() {
    return this.form.hasTextBoxError(passwordFieldName);
  }

  getPasswordError() {
    return this.form.getTextBoxErrorMessage(passwordFieldName);
  }

  hasConfirmPasswordError() {
    return this.form.hasTextBoxError(confirmPasswordFieldName);
  }

  getConfirmPasswordError() {
    return this.form.getTextBoxErrorMessage(confirmPasswordFieldName);
  }

  // This will be used by any password page that has requirements on it.
  getRequirements() {
    return this.form.getElement(requirementsSelector).innerText;
  }

  requirementsExist() {
    return this.form.elementExist(requirementsSelector);
  }

  getErrorBoxText() {
    return this.form.getErrorBoxText();
  }

  clickChangePasswordButton() {
    return this.form.clickSaveButton('Change Password');
  }

  changePasswordButtonExists() {
    return this.form.getButton('Change Password').exists;
  }

  remindMeLaterLinkExists() {
    return this.form.getLink('Remind me later').exists;
  }

  async clickRemindMeLaterLink() {
    await this.t.click(this.getLink('Remind me later'));
  }

  doesTextExist(content) {
    return this.form.getTextElement(content).exists;
  }
}

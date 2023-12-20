import BasePageObject from './BasePageObject';

const passwordFieldName = 'credentials\\.passcode';
const confirmPasswordFieldName = 'confirmPassword';
const requirementsSelector = '[data-se="password-authenticator--rules"]';
const revokeSessionToggle = 'credentials.revokeSessions';
const resetPasswordButtonName = 'Reset Password';

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

  clickNextButton(name = 'Next') {
    return this.form.clickSaveButton(name);
  }

  clickResetPasswordButton() {
    this.form.clickButton(resetPasswordButtonName);
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  hasPasswordError() {
    return this.form.hasTextBoxErrorMessage(passwordFieldName);
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

  hasPasswordMatchRequirementStatus(expectComplete = false) {
    const expectedIconId = expectComplete ? 'passwordRequirementIcon-complete' : 'passwordRequirementIcon-incomplete';
    const passwordMatchWrapper = this.form.getElement('[data-se="password-authenticator--matches');
    // Status SVG icon is aria-hidden and does not have a name or title identifier
    return passwordMatchWrapper.find(`[data-se="${expectedIconId}"`).exists;
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

  sessionRevocationToggleExist() {
    return this.form.elementExist(`input[name="${revokeSessionToggle}"]`);
  }

  checkSessionRevocationToggle() {
    return this.form.clickElement(`input[name="${revokeSessionToggle}"]`);
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
    await this.t.click(this.form.getLink('Remind me later'));
  }

  doesTextExist(content) {
    return this.form.getByText(content).exists;
  }

  resetPasswordButtonExists() {
    return this.form.getButton(resetPasswordButtonName).exists;
  }
}

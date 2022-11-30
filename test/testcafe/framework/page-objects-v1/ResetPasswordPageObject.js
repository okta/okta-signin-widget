import { Selector, ClientFunction } from 'testcafe';
import BasePageObject from '../page-objects/BasePageObject';

const BACK_TO_SIGN_IN_SELECTOR = '[data-se="signout-link"]';
const REVOKE_SESSIONS_WRAPPER = '.o-form-input-name-revokeSessions';
const ANSWER_INPUT_NAME = 'answer';
const NEW_PASSWORD_INPUT_NAME = 'newPassword';
const CONFIRM_PASSWORD_INPUT_NAME = 'confirmPassword';
const REVOKE_SESSIONS_CHECKBOX_NAME = 'revokeSessions';
const RESET_PASSWORD_BUTTON = '.o-form-button-bar .button-primary';

export default class ResetPasswordPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.url = '/signin/reset-password/dfp9WP5cn87lUF3--kqt';
  }

  isBackToSignInPresent() {
    return Selector(BACK_TO_SIGN_IN_SELECTOR).exists;
  }

  isRevokeSessionsPresent() {
    return Selector(REVOKE_SESSIONS_WRAPPER).exists;
  }

  async clickBackToSignInLink() {
    await this.t.click(Selector(BACK_TO_SIGN_IN_SELECTOR));
  }

  async getPageUrl() {
    return await ClientFunction(() => window.location.href)();
  }

  answerChallenge(answer) {
    return this.form.setTextBoxValue(ANSWER_INPUT_NAME, answer);
  }

  setNewPassword(newPassword) {
    return this.form.setTextBoxValue(NEW_PASSWORD_INPUT_NAME, newPassword);
  }

  setConfirmPassword(confirmPassword) {
    return this.form.setTextBoxValue(CONFIRM_PASSWORD_INPUT_NAME, confirmPassword);
  }

  async clickResetPasswordButton() {
    await this.t.click(Selector(RESET_PASSWORD_BUTTON));
  }

  async setRevokeSessionsCheckbox(value) {
    return this.form.setCheckbox(REVOKE_SESSIONS_CHECKBOX_NAME, value);
  }
}

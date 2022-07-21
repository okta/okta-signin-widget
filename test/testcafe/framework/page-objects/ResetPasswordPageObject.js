import { Selector, ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

const BACK_TO_SIGN_IN_SELECTOR = '[data-se="signout-link"]';

export default class ResetPasswordPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.url = '/signin/reset-password/dfp9WP5cn87lUF3--kqt';
  }

  isBackToSignInPresent() {
    return Selector(BACK_TO_SIGN_IN_SELECTOR).exists;
  }

  async clickBackToSignInLink() {
    await this.t.click(Selector(BACK_TO_SIGN_IN_SELECTOR));
  }

  async getPageUrl() {
    return await ClientFunction(() => window.location.href)();
  }
}

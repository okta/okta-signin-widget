import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SignInPasskeysPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
  }

  getPasskeyButtonIcon() {
    return this.form.getElement('.okta-passkeys-container [data-se="button"] span').getAttribute('class');
  }

  getPasskeyButtonLabel() {
    return this.getTextContent('.okta-passkeys-container [data-se="button"]');
  }

  async clickLaunchPasskeyButton() {
    await this.t.click(Selector('.sign-in-with-passkeys-option .okta-passkeys-container .link-button'));
  }
}

import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SignInWebAuthnViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
  }

  getWebAuthnButtonIcon() {
    return this.form.getElement('.okta-webauthn-container [data-se="button"] span').getAttribute('class');
  }

  getWebAuthnButtonLabel() {
    return this.getTextContent('.okta-webauthn-container [data-se="button"]');
  }

  async clickLaunchWebAuthnButton() {
    await this.t.click(Selector('.sign-in-with-webauthn-option .okta-webauthn-container .link-button'));
  }
}

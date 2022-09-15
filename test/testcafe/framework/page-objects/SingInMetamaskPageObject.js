import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SignInMetamaskPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
  }

  getMetamaskButtonIcon() {
    return this.form.getElement('.okta-metamask-container [data-se="button"] span').getAttribute('class');
  }

  getMetamaskButtonLabel() {
    return this.getTextContent('.okta-metamask-container [data-se="button"]');
  }

  async clickLaunchMetamaskButton() {
    await this.t.click(Selector('.sign-in-with-metamask-option .okta-metamask-container .link-button'));
  }
}

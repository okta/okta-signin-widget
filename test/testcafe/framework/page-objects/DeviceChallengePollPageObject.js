import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class DeviceChallengePollViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.body = new Selector('.device-challenge-poll');
    this.footer = new Selector('.auth-footer');
  }

  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getContent() {
    return this.getTextContent('[data-se="o-form-fieldset-container"]');
  }

  getFooterLink() {
    return this.footer.find('[data-se="sign-in-options"]');
  }

  getSpinner() {
    return this.body.find('.spinner');
  }

  async clickUniversalLink() {
    await this.t.click(Selector('.ul-button'));
  }
}

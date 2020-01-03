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

  getSubtitle() {
    return this.body.find('[data-se="o-form-explain"]').innerText;
  }

  getContent() {
    return this.body.find('[data-se="o-form-fieldset-container"]').innerText;
  }

  getFooterLink() {
    return this.footer.find('[data-se="sign-in-options"]');
  }

  async clickLaunchOktaVerifyLink() {
    await this.t.click(this.body.find('#launch-ov'));
  }
}

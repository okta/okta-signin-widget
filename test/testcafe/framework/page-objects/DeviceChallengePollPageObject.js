import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class DeviceChallengePollViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.body = new Selector('.device-challenge-poll');
  }

  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getSubtitle() {
    return this.body.find('[data-se="o-form-explain"]').innerText;
  }

  getFooterBackLink() {
    return this.footer.find('[data-se="back"]');
  }
}

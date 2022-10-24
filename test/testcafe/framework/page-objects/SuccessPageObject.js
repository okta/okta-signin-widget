import { ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SuccessPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }
  async getPageUrl() {
    await this.t.expect(this.form.getTextElementOnScreen('Mock User Dashboard').exists).eql(true);

    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }
}

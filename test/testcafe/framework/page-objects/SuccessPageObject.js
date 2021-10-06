import { Selector, ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SuccessPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }
  async getPageUrl() {
    await this.t.expect(Selector('#mock-user-dashboard-title').innerText).eql('Mock User Dashboard');

    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }
}

import { Selector, ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SuccessPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }
  async getPageUrl() {
    // success is redirect to httpbin.org
    await this.t.expect(Selector('title').innerText).eql('httpbin.org');

    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }
}

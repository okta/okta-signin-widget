import { Selector, ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SuccessPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }
  async getPageUrl() {
    await this.t.expect(Selector('h1').innerText).eql('Mock User Dashboard');

    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }
  getMessages() {
    return this.form.getInnerTexts('[data-se="o-form-error-container"]');
  }
  getDescriptions() {
    return this.form.getInnerTexts('[data-se="o-form-fieldset-container"]');
  }
}

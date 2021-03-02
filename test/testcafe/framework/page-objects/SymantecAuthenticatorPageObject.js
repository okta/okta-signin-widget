import { ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SymantecAuthenticatorPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  async getPageUrl() {
    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getPageSubtitle() {
    return this.form.getElement('.okta-form-subtitle').textContent;
  }

  submit() {
    return this.form.clickSaveButton();
  }
}

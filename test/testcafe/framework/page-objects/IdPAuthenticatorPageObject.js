import { ClientFunction } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class IdPAuthenticatorPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  async getPageUrl() {
    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getPageSubtitle() {
    return this.form.getElement('.okta-form-subtitle').textContent;
  }

  getErrorFromErrorBox() {
    return this.form.getElement('.o-form-error-container').textContent;
  }

  submit() {
    return this.form.clickSaveButton();
  }
}

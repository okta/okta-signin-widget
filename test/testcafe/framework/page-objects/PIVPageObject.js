import BasePageObject from './BasePageObject';

export default class PIVPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  identifierFieldExists(selector) {
    return this.form.elementExist(selector);
  }

  getIdpButton(selector) {
    return this.form.getCallout(selector);
  }

  clickIdpButton(selector) {
    return this.form.clickElement(selector);
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getPageSubtitle() {
    return this.form.getElement('.piv-verify-text').textContent;
  }

  getErrorFromErrorBox() {
    return this.form.getElement('.o-form-error-container').textContent;
  }

  submit() {
    return this.form.clickSaveButton();
  }
}

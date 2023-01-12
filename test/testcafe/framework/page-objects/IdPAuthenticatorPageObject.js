import BasePageObject from './BasePageObject';

export default class IdPAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
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

import BasePageObject from './BasePageObject';

export default class IdPAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getPageSubtitle() {
    return this.form.getSubtitle();
  }

  getErrorFromErrorBox() {
    return this.form.getErrorBoxText();
  }

  submit(name) {
    return this.form.clickSaveButton(name);
  }
}

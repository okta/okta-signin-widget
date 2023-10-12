import BasePageObject from '../page-objects/BasePageObject';

export default class SmsEnrollPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getPageSubtitle() {
    return this.form.getElement('.okta-form-subtitle').textContent;
  }
}
import BasePageObject from './BasePageObject';

const EMAIL_FIELD = 'email';

export default class EnrollOVViaEmailPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  fillEmailField(value) {
    return this.form.setTextBoxValue(EMAIL_FIELD, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }
}

import BasePageObject from './BasePageObject';

const PHONE_FIELD = 'phone';

export default class EnrollOVViaEmailPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  fillPhoneField(value) {
    return this.form.setTextBoxValue(PHONE_FIELD, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }
}

import BasePageObject from './BasePageObject';

export default class EnrollProfileUpdateViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickFinishButton() {
    return this.form.clickSaveButton();
  }

  getTextBoxErrorMessage(fieldName) {
    return this.form.getTextBoxErrorMessage(fieldName);
  }

  getFormFieldSubLabel(fieldName) {
    return this.form.getFormFieldSubLabel(fieldName);
  }
}

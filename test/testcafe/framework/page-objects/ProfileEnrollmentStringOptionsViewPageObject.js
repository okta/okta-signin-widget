import BasePageObject from './BasePageObject';

export default class ProfileEnrollmentStringOptionsViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getDropDownComponent(fieldName) {
    return this.form.findFormFieldInput(fieldName).visible;
  }

  selectValueFromDropdown(fieldName, index) {
    return this.form.selectValueChozenDropdown(fieldName, index);
  }

  clickRadioButton(fieldName, index) {
    return this.form.selectRadioButtonOption(fieldName, index);
  }

  clickFinishButton() {
    return this.form.clickSaveButton();
  }

  fillEmailField(value) {
    return this.form.setTextBoxValue('userProfile.email', value);
  }

  fillFirstNameField(value) {
    return this.form.setTextBoxValue('userProfile.firstName', value);
  }

  fillLastNameField(value) {
    return this.form.setTextBoxValue('userProfile.lastName', value);
  }
}

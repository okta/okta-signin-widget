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

  clickSignUpButton() {
    return this.form.clickSaveButton('Sign Up');
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

  fillOptionalField(value) {
    return this.form.setTextBoxValue('userProfile.string1', value);
  }

  dropDownFieldByLabelExists(label) {
    return this.form.fieldByLabelExists(label, { selector: 'select' });
  }
}

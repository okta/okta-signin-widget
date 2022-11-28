import BasePageObject from './BasePageObject';

export default class EnrollProfileViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  setTextBoxValue(fieldName, text) {
    return this.form.setTextBoxValue(fieldName, text);
  }

  isDropdownVisible(fieldName) {
    return this.form.findFormFieldInput(fieldName).visible;
  }

  selectValueFromDropdown(fieldName, index) {
    return this.form.selectValueChozenDropdown(fieldName, index);
  }

  getValueFromDropdown(fieldName) {
    return this.form.getValueFromDropdown(fieldName);
  }

  clickRadioButton(fieldName, index) {
    return this.form.selectRadioButtonOption(fieldName, index);
  }

  setCheckbox(fieldName){
    this.form.setCheckbox(fieldName);
  }

  getCheckboxValue(fieldName){
    return this.form.getCheckboxValue(fieldName);
  }

  signUpButtonExists() {
    return this.form.getButton('Sign Up').exists;
  }

  submitButtonExists() {
    return this.form.getButton('Submit').exists;
  }

  formFieldExistsByLabel(label) {
    return this.form.fieldByLabelExists(label);
  }

  dropDownExistsByLabel(label) {
    return this.form.fieldByLabelExists(label, { selector: 'select' });
  }

  hasText(text) {
    return this.form.getByText(text).exists;
  }
}

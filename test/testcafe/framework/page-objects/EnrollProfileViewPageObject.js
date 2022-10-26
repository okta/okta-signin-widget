import BasePageObject from './BasePageObject';

const requirementsSelector = '[data-se="password-authenticator--rules"]';

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
    return this.form.getByLabelText(label).exists;
  }

  dropDownExistsByLabel(label) {
    return this.form.getByLabelText(label, { selector: 'select' }).exists;
  }

  getRequirements() {
    return this.form.getElement(requirementsSelector).innerText;
  }
}

import BasePageObject from './BasePageObject';

export default class EnrollProfileViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  isDropdownVisible(fieldName) {
    return this.form.findFormFieldInput(fieldName).visible;
  }

  selectValueFromDropdown(fieldName, index) {
    return this.form.selectValueChozenDropdown(fieldName, index);
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

}

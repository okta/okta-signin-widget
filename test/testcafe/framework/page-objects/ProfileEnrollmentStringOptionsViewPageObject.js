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
}

import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

const IDPS_CONTAINER = '.okta-idps-container';
const CUSTOM_IDP_BUTTON = '.social-auth-general-idp-button';

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
    return this.form.selectValueDropdown(fieldName, index);
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

  getIdpsContainer() {
    return Selector(IDPS_CONTAINER);
  }

  getCustomIdpButtonLabel(index) {
    return Selector(CUSTOM_IDP_BUTTON).nth(index).textContent;
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

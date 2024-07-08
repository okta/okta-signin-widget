import EnrollProfileViewPageObject from './EnrollProfileViewPageObject';
import { Selector } from 'testcafe';

const FORM_DESCRIPTION = '[data-se="o-form-explain"]';
const CUSTOM_BOOL_LABEL = '.custom_bool_title';

export default class CustomizedEnrollProfileViewPageObject extends EnrollProfileViewPageObject {
  constructor(t) {
    super(t);
  }

  getFormDescription() {
    return Selector(FORM_DESCRIPTION);
  }

  getCustomBoolLabel() {
    return Selector(CUSTOM_BOOL_LABEL);
  }

  getFormDescriptionText() {
    return this.getFormDescription().textContent;
  }

  getCustomBoolLabelText() {
    return this.getCustomBoolLabel().textContent;
  }

  signUpButtonExists(name) {
    return this.form.getButton(name ?? 'Sign Up').exists;
  }

}

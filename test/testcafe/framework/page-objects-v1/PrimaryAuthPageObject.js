import { Selector } from 'testcafe';
import BasePageObject from '../page-objects/BasePageObject';

export default class PrimaryAuthPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasUsernameField() {
    return this.form.fieldByLabelExists('Username');
  }

  getInputField(fieldName) {
    return this.form.findFormFieldInput(fieldName).child('input');
  }

  setUsername(username) {
    return this.form.setTextBoxValue('username', username);
  }

  getLinkElement(name) {
    return this.form.getLink(name);
  }

  getShowPasswordVisibilityToggle() {
    return this.form.getElement('span.eyeicon.button-show');
  }

  getHidePasswordVisibilityToggle() {
    return this.form.getElement('span.eyeicon.button-hide');
  }

  getBeaconContainer() {
    return Selector('.beacon-container');
  }

  getSecurityImageTooltip() {
    return Selector('.okta-security-image-tooltip');
  }

  async clickNextButton(name = 'Next') {
    await this.form.clickSaveButton(name);
  }

  async clickLinkElement(name) {
    await this.t.click(this.getLinkElement(name));
  }
}

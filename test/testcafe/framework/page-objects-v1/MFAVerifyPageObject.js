import { Selector } from 'testcafe';
import BasePageObject from '../page-objects/BasePageObject';

export default class MFAVerifyPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getInputField(fieldName) {
    return this.form.findFormFieldInput(fieldName).child('input');
  }

  getLinkElement(name) {
    return this.form.getLink(name);
  }

  getBeaconContainer() {
    return Selector('.beacon-container');
  }

  getFactorsDropdownLink() {
    return Selector('a').withAttribute('aria-controls', 'okta-dropdown-options');
  }

  async clickFactorsDropdown() {
    await this.t.click(this.getFactorsDropdownLink());
  }

  async clickBeacon() {
    await this.t.click(this.getBeaconContainer());
  }

  async clickVerifyButton() {
    await this.form.clickSaveButton('Verify');
  }

  async clickLinkElement(name) {
    await this.t.click(this.getLinkElement(name));
  }
}

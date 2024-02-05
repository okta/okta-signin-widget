import { Selector } from 'testcafe';
import BasePageObject from '../page-objects/BasePageObject';

export default class MFAOktaVerifyPageObject extends BasePageObject {
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

  oktaVerifyBeaconExists() {
    return Selector('.beacon-container .mfa-okta-verify').exists;
  }

  getIframe() {
    return Selector('iframe');
  }

  hasIframe() {
    return this.getIframe().exists;
  }

  parseAuthorizeUrlParams(url) {
    const parsed = new URL(url);
    return parsed.searchParams;
  }

  async setCodeValue(val) {
    const element = Selector('.o-form').nth(1).find('input[name="answer"]');
    // clear existing text
    await this.t
      .selectText(element)
      .pressKey('delete');

    // type new text
    await this.t.typeText(element, val);
  }

  async clickLinkElement(name) {
    await this.t.click(this.getLinkElement(name));
  }
}

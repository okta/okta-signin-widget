import BasePageObject from '../page-objects/BasePageObject';

export default class ForgotPasswordPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async clickLinkElement(name) {
    await this.t.click(this.form.getLink(name));
  }
}
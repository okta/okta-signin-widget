import BasePageObject from './BasePageObject';

export default class DuoPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async clickDuoMockLink() {
    await this.t.switchToIframe('iframe');
    await this.t.click('#duoVerifyLink');
    await this.t.switchToMainWindow();
  }

  hasDuoIframe() {
    return this.form.elementExist('iframe');
  }
}

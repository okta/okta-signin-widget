import BasePageObject from './BasePageObject';

export default class EnrollOktaVerifyPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  hasEnrollViaQRInstruction() {
    return this.form.elementExist('.qrcode-info');
  }

  hasQRcode() {
    return this.form.elementExist('.qrcode');
  }

  hasEnrollViaEmailInstruction () {
    return this.form.elementExist('.email-info');
  }

  hasEnrollViaSmsInstruction () {
    return this.form.elementExist('.sms-info');
  }

  getQRInstruction() {
    return this.getTextContent('.qrcode-info');
  }

  getEmailInstruction() {
    return this.getTextContent('.email-info');
  }

  getSmsInstruction() {
    return this.getTextContent('.sms-info');
  }

  hasSwitchChannelLink () {
    return this.form.elementExist('.js-switch-channel');
  }

  async clickSwitchChannel () {
    await this.form.clickElement('.js-switch-channel');
  }
}

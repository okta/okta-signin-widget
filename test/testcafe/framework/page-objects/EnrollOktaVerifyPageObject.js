import BasePageObject from './BasePageObject';

const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';

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

  getSwitchChannelText () {
    return this.getTextContent('.switch-channel-link');
  }

  async clickSwitchChannel () {
    await this.form.clickElement('.switch-channel-link');
  }

  resendView() {
    return this.form.getElement('.resend-ov-link-view');
  }

  async clickSendAgainLink() {
    await this.form.clickElement('.resend-ov-link-view a.resend-link');
  }

  getErrorBox () {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }

  getErrorTitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  async switchAuthenticator() {
    return this.t.click('[data-se="switchAuthenticator"]');
  }
}

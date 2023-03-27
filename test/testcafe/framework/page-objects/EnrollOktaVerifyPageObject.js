import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';

export default class EnrollOktaVerifyPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async hasEnrollViaQRInstruction() {
    if (userVariables.v3) {
      const qrInstruction = await this.getNthInstructionBulletPoint(0);
      return qrInstruction.includes('Okta Verify');
    }
    return this.form.elementExist('.qrcode-info');
  }

  hasQRcode() {
    if (userVariables.v3) {
      return this.form.elementExist('.qrImg');
    }
    return this.form.elementExist('.qrcode');
  }

  hasEnrollViaEmailInstruction() {
    return this.form.elementExist('.email-info');
  }

  hasEnrollViaSmsInstruction() {
    return this.form.elementExist('.sms-info');
  }

  getQRInstruction(index) {
    if (userVariables.v3) {
      // return this.getTextContent('.o-form');
      return this.getNthInstructionBulletPoint(index);
    }
    return this.getTextContent('.qrcode-info');
  }

  async getNthInstructionBulletPoint(index) {
    const listItems = within(this.form.el).getAllByRole('listitem');
    return listItems.nth(index).innerText;
  }

  getEmailInstruction() {
    return this.getTextContent('.email-info');
  }

  getSmsInstruction() {
    return this.getTextContent('.sms-info');
  }

  getSwitchChannelText() {
    return this.getTextContent('.switch-channel-link');
  }

  async clickSwitchChannel() {
    if (userVariables.v3) {
      const switchLink = this.form.getLink('try a different way');
      await this.t.click(switchLink);
    }
    await this.form.clickElement('.switch-channel-link');
  }

  resendView() {
    return this.form.getElement('.resend-ov-link-view');
  }

  async clickSendAgainLink() {
    await this.form.clickElement('.resend-ov-link-view a.resend-link');
  }

  getErrorBox() {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }

  getErrorTitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  async switchAuthenticator() {
    return this.t.click('[data-se="switchAuthenticator"]');
  }
}

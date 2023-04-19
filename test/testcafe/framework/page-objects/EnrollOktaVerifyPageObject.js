import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FORM_INFOBOX_ERROR_TITLE_V3 = '[data-se="callout"] > div > h2';
const CANT_SCAN_BUTTON_SELECTOR = 'button[aria-label="Setup without scanning a QR code."]';
const FORM_SELECTOR = '[data-se="o-form-explain"]';

export default class EnrollOktaVerifyPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async hasEnrollViaQRInstruction() {
    if (userVariables.v3) {
      if (await this.form.elementExist('.qrImg')) {
        const qrInstruction = await this.getNthInstructionBulletPoint(0);
        return qrInstruction.includes('Okta Verify');
      } else {
        return false;
      }
    }
    return this.form.elementExist('.qrcode-info');
  }

  hasQRcode() {
    if (userVariables.v3) {
      return this.form.elementExist('.qrImg');
    }
    return this.form.elementExist('.qrcode');
  }

  async hasEnrollViaEmailInstruction() {
    if (userVariables.v3) {
      if (await this.form.elementExist(FORM_SELECTOR)) {
        const instruction = await this.form.getElement(FORM_SELECTOR).innerText;
        return instruction.includes('email');
      } else {
        return false;
      }
    }
    return this.form.elementExist('.email-info');
  }

  async hasEnrollViaSmsInstruction() {
    if (userVariables.v3) {
      if (await this.form.elementExist(FORM_SELECTOR)) {
        const instruction = await this.form.getElement(FORM_SELECTOR).innerText;
        return instruction.includes('SMS');
      } else {
        return false;
      }
    }
    return this.form.elementExist('.sms-info');
  }

  getQRInstruction(index) {
    if (userVariables.v3) {
      return this.getNthInstructionBulletPoint(index);
    }
    return this.getTextContent('.qrcode-info');
  }

  async getNthInstructionBulletPoint(index) {
    const listItems = within(this.form.el).getAllByRole('listitem');
    return listItems.nth(index).innerText;
  }

  getEmailInstruction() {
    if (userVariables.v3) {
      return this.getTextContent('[data-se="o-form-explain"]'); 
    }
    return this.getTextContent('.email-info');
  }

  getSmsInstruction() {
    if (userVariables.v3) {
      return this.getTextContent('[data-se="o-form-explain"]'); 
    }
    return this.getTextContent('.sms-info');
  }

  getSwitchChannelText() {
    if (userVariables.v3) {
      return this.getTextContent(CANT_SCAN_BUTTON_SELECTOR);
    }
    return this.getTextContent('.switch-channel-link');
  }

  async clickSwitchChannel() {
    if (userVariables.v3) {
      await this.form.clickElement(CANT_SCAN_BUTTON_SELECTOR);
    } else {
      await this.form.clickElement('.switch-channel-link');
    }
  }

  getTryDifferentWayText() {
    return this.getTextContent('.switch-channel-link');
  }

  async clickTryDifferentWay() {
    await this.form.clickElement('.switch-channel-link');
  }

  resendView() {
    if (userVariables.v3) {
      return this.form.getAlertBox();
    }
    return this.form.getElement('.resend-ov-link-view');
  }

  resendViewExists() {
    if (userVariables.v3) {
      return this.form.hasAlertBox();
    }
    return this.form.getElement('.resend-ov-link-view').visible;
  }

  async clickSendAgainLink() {
    if (userVariables.v3) {
      const resendEmail = this.form.getLink('send again');
      await this.t.click(resendEmail);
    } else {
      await this.form.clickElement('.resend-ov-link-view a.resend-link');
   }
  } 

  async clickSendSMSAgainLink() {
    if (userVariables.v3) {
      const resendEmail = this.form.getLink('Send again');
      await this.t.click(resendEmail);
    } else {
      await this.form.clickElement('.resend-ov-link-view a.resend-link');
   }
  } 

  getErrorBox() {
    return this.form.getErrorBox();
  }

  getErrorTitle() {
    if (userVariables.v3) {
      return this.form.getElement(FORM_INFOBOX_ERROR_TITLE_V3);
    }
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  async switchAuthenticator() {
    return this.t.click('[data-se="switchAuthenticator"]');
  }

  getFormTitle(index) {
    if (userVariables.v3 && index != undefined) {
      return this.form.getNthTitle(index);
    }
    return this.form.getTitle();
  }
}
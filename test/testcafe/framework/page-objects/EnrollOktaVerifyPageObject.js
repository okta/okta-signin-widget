import BasePageObject from './BasePageObject';
import { userVariables, Selector } from 'testcafe';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FORM_INFOBOX_ERROR_TITLE_V3 = '[data-se="callout"] h2';
const CANT_SCAN_BUTTON_TEXT = 'Setup without scanning a QR code.';
const FORM_SELECTOR = '[data-se="o-form-explain"]';
const SUB_HEADER = '[data-se="subheader"]';
const COPY_ORG_LINK_BUTTON_CLASS = '.copy-org-clipboard-button';
const CLIPBOARD_TEXT = 'data-clipboard-text';
const DOWNLOAD_OV_LINK_CLASS = '.download-ov-link';
const CLOSING_CLASS = '.closing';

export default class EnrollOktaVerifyPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.body = new Selector('.ov-info');
  }

  async hasEnrollViaQRInstruction() {
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      return this.form.elementExist('.qrImg');
    }
    return this.form.elementExist('.qrcode');
  }

  async hasEnrollViaEmailInstruction() {
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      return this.getNthInstructionBulletPoint(index);
    }
    return this.getTextContent('.qrcode-info');
  }

  async getNthInstructionBulletPoint(index) {
    const listItems = within(this.form.el).getAllByRole('listitem');
    return listItems.nth(index).innerText;
  }

  getEmailInstruction() {
    if (userVariables.gen3) {
      return this.getTextContent('[data-se="o-form"]'); 
    }
    return this.getTextContent('.email-info');
  }

  getSmsInstruction() {
    if (userVariables.gen3) {
      return this.getTextContent('[data-se="o-form"]'); 
    }
    return this.getTextContent('.sms-info');
  }

  getSwitchChannelText() {
    if (userVariables.gen3) {
      return this.form.getButton(CANT_SCAN_BUTTON_TEXT).textContent;
    }
    return this.getTextContent('.switch-channel-link');
  }

  async clickSwitchChannel() {
    if (userVariables.gen3) {
      await this.form.clickButton(CANT_SCAN_BUTTON_TEXT);
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
    if (userVariables.gen3) {
      return this.form.getAlertBox();
    }
    return this.form.getElement('.resend-ov-link-view');
  }

  resendViewExists() {
    if (userVariables.gen3) {
      return this.form.hasAlertBox();
    }
    return this.form.getElement('.resend-ov-link-view').visible;
  }

  async clickSendAgainLink() {
    if (userVariables.gen3) {
      const resendEmail = this.form.getLink('send again');
      await this.t.click(resendEmail);
    } else {
      await this.form.clickElement('.resend-ov-link-view a.resend-link');
    }
  } 

  async clickSendSMSAgainLink() {
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      return this.form.getElement(FORM_INFOBOX_ERROR_TITLE_V3);
    }
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  async switchAuthenticator() {
    return this.t.click('[data-se="switchAuthenticator"]');
  }

  getFormTitle(index) {
    if (userVariables.gen3 && index !== undefined) {
      return this.form.getNthTitle(index);
    }
    return this.form.getTitle();
  }

  getSubHeader() {
    if (userVariables.gen3) {
      return this.form.getSubtitle(0);
    }
    return this.getTextContent(SUB_HEADER);
  }
  
  getCopyOrgLinkButtonLabel() {
    if (userVariables.gen3) {
      return this.form.getButton('Copy sign-in URL to clipboard').innerText;
    }
    return this.getTextContent(COPY_ORG_LINK_BUTTON_CLASS);
  }

  getCopiedOrgLinkValue() {
    return this.body.find(COPY_ORG_LINK_BUTTON_CLASS).getAttribute(CLIPBOARD_TEXT);
  }

  getDownloadAppHref() {
    return this.form.el.find(DOWNLOAD_OV_LINK_CLASS).getAttribute('href');
  }

  getClosingText() {
    if (userVariables.gen3) {
      return this.form.getSubtitle(5);
    }
    return this.getTextContent(CLOSING_CLASS);
  }
}

import BasePageObject from './BasePageObject';
import { userVariables, Selector } from 'testcafe';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FORM_INFOBOX_ERROR_TITLE_V3 = '[data-se="callout"] h2';
const CANT_SCAN_BUTTON_TEXT = 'Setup without scanning a QR code.';
const SETUP_OV_BUTTON_TEXT = 'Set up Okta Verify';
const SETUP_ON_ANOTHER_MOBILE_DEVICE_TEXT = 'set up Okta Verify on another mobile device';
const SETUP_ON_THIS_DEVICE_TEXT = 'set up Okta Verify on this device';
const GO_BACK_LINK_TEXT = 'Go back';
const FORM_SELECTOR = '[data-se="o-form-explain"]';
const SUB_HEADER = '[data-se="subheader"]';
const COPY_ORG_LINK_BUTTON_CLASS = '.copy-org-clipboard-button';
const CLIPBOARD_TEXT = 'data-clipboard-text';
const DOWNLOAD_OV_LINK_CLASS = '.download-ov-link';
const APP_STORE_LINK_CLASS = userVariables.gen3 ? '[data-se="app-store-link"]' : '.app-store-logo';
const OV_SETUP_LINK_CLASS = '.setup-button';
const BACK_LINK_CLASS = '.ovSetupScreen';
const OR_ON_MOBILE_DEVICE_LINK_CLASS = '.orOnMobileLink';
const DESKTOP_INSTRUCTIONS_CLASS = '.desktop-instructions';
const CLOSING_CLASS = '.closing';

export default class EnrollOktaVerifyPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.body = new Selector('.ov-info');
  }

  async hasEnrollViaQRInstruction() {
    if (userVariables.gen3) {
      if (await this.form.elementExist('[data-se="qrImg"]')) {
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
      return this.form.elementExist('[data-se="qrImg"]');
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

  async hasOVSetupButton() {
    if (userVariables.gen3) {
      return this.form.getButton(SETUP_OV_BUTTON_TEXT).exists;
    }
    return this.form.el.find(OV_SETUP_LINK_CLASS).exists;
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

  async nthInstructionBulletPointExists(index) {
    const listItems = within(this.form.el).getAllByRole('listitem');
    return listItems.nth(index).exists;
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

  async getSameDeviceReturnAndSetupText() {
    if (userVariables.gen3) {
      return await this.form.getSubtitle(1);
    }

    return this.getNthInstructionBulletPoint(1);
  }

  async getDesktopPromptText() {
    if (userVariables.gen3) {
      return await this.form.getSubtitle(0);
    }

    return this.nthDesktopInstructions(0);
  }

  async getDesktopNoPromptText() {
    if (userVariables.gen3) {
      return await this.form.getSubtitle(1);
    }

    return this.nthDesktopInstructions(1);
  }

  async getDesktopEnsureOVInstalledText() {
    if (userVariables.gen3) {
      return await this.form.getSubtitle(2);
    }

    return this.nthDesktopInstructions(2);
  }

  async getSameDeviceSetupOnMobileText() {
    if (userVariables.gen3) {
      return this.form.getLink(SETUP_ON_ANOTHER_MOBILE_DEVICE_TEXT).innerText;
    }

    return this.getNthInstructionBulletPoint(3);
  }

  async getSameDeviceDownloadText() {
    return this.form.getElement('#download-ov').parent().innerText;

  }

  async sameDeviceSetupOnMobileTextExist() {
    if (userVariables.gen3) {
      return this.form.getLink(SETUP_ON_ANOTHER_MOBILE_DEVICE_TEXT).exists;
    }

    return this.nthDesktopInstructionsExist(3);
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

  getAppStoreHref() {
    return this.form.el.find(APP_STORE_LINK_CLASS).getAttribute('href');
  }

  getOVSetupHref() {
    return this.form.el.find(OV_SETUP_LINK_CLASS).getAttribute('href');
  }

  getOrAnotherMobileDeviceLink() {
    if (userVariables.gen3) {
      return this.form.getLink(SETUP_ON_ANOTHER_MOBILE_DEVICE_TEXT);
    }

    return this.form.getElement(OR_ON_MOBILE_DEVICE_LINK_CLASS);
  }

  orAnotherMobileDeviceLinkExists() {
    return this.getOrAnotherMobileDeviceLink().exists;
  }

  async clickOrAnotherMobileDeviceLink() {
    await this.t.click(this.getOrAnotherMobileDeviceLink());
  }

  getSetupOnThisDeviceLink() {
    if (userVariables.gen3) {
      return this.form.getLink(SETUP_ON_THIS_DEVICE_TEXT);
    }

    return this.form.getElement('.ov-same-device-enroll-link');
  }

  setupOnThisDeviceLinkExists() {
    return this.getSetupOnThisDeviceLink().exists;
  }

  async clickSetupOnThisDeviceLink() {
    await this.t.click(this.getSetupOnThisDeviceLink());
  }

  async clickBackLink() {
    if (userVariables.gen3) {
      const link = this.form.getLink(GO_BACK_LINK_TEXT);
      await this.t.click(link);
      return;
    }

    await this.form.clickElement(BACK_LINK_CLASS);
  }

  async clickOVSetupButton() {
    if (userVariables.gen3) {
      await this.t.click(this.form.getButton("Set up Okta Verify"));
    } else {
      await this.t.click(this.form.el.find(OV_SETUP_LINK_CLASS));
    }
  }

  async nthDesktopInstructions(index) {
    return Selector(DESKTOP_INSTRUCTIONS_CLASS).nth(index).innerText;
  }

  async nthDesktopInstructionsExist(index) {
    return Selector(DESKTOP_INSTRUCTIONS_CLASS).nth(index).exists;
  }

  getAlt() {
    return this.form.getElement(
      userVariables.gen3 ? '[data-se="qrImg"]' : '.qrcode'
    )?.getAttribute('alt');
  }

  getClosingText() {
    if (userVariables.gen3) {
      return this.form.getSubtitle(5);
    }
    return this.getTextContent(CLOSING_CLASS);
  }

  async appStoreElementExists() {
    return this.form.el.find(APP_STORE_LINK_CLASS).exists;
  }
}

import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const CODE_FIELD_NAME = 'credentials.passcode';
const CODE_FIELD_SELECTOR = 'label[for="credentials.passcode"]';

export default class EnrollGoogleAuthenticatorPageObject extends BasePageObject {

  constructor(t) {
    super(t);
  }

  getBarcodeSubtitle() {
    if (userVariables.gen3) {
      return this.getTextContent('[data-se="barcode-setup-title"]');
    }
    return this.getTextContent('.barcode-setup-title');
  }

  getmanualSetupSubtitle() {
    if (userVariables.gen3) {
      return this.getTextContent('[data-se="manual-setup-title"]');
    }
    return this.getTextContent('.manual-setup-title');
  }

  isEnterCodeSubtitleVisible() {
    if (userVariables.gen3) {
      return this.form.getElement(CODE_FIELD_SELECTOR).visible;
    }
    return this.form.getElement('.enter-code-title').visible;
  }

  getSetUpDescription() {
    if (userVariables.gen3) {
      return this.getTextContent('[data-se="google-authenticator-setup-info"]');
    }
    return this.getTextContent('.google-authenticator-setup-info');
  }

  hasQRcode() {
    if (userVariables.gen3) {
      return this.form.elementExist('[data-se="qrImg"]');
    }
    return this.form.elementExist('.qrcode');
  }

  getSharedSecret() {
    if (userVariables.gen3) {
      return this.form.getSubtitle();
    }
    return this.form.getElement('.shared-secret input').getAttribute('placeholder');
  }

  async goTomanualSetup() {
    if (userVariables.gen3) {
      return this.form.clickButton('Can\'t scan?');
    }
    await this.form.clickElement('.cannot-scan-link');
  }

  async goToNextPage() {
    if (userVariables.gen3) {
      return this.form.clickButton('Next');
    }
    await this.form.clickElement('.google-authenticator-next');
  }

  async submit() {
    if (userVariables.gen3) {
      return this.form.clickButton('Verify');
    }
    await this.form.clickElement('.google-authenticator-verify');
  }

  getOtpLabel() {
    if (userVariables.gen3) {
      return this.getTextContent(CODE_FIELD_SELECTOR);
    }
    return this.form.getFormFieldLabel(CODE_FIELD_NAME);
  }

  enterCode(value) {
    return this.form.setTextBoxValue(CODE_FIELD_NAME, value);
  }

  getCodeFieldError() {
    return this.form.getTextBoxErrorMessage(CODE_FIELD_NAME);
  }

  getNextButton() {
    if (userVariables.gen3) {
      return this.form.getButton('Next');
    }
    return this.form.getElement('.google-authenticator-next');
  }
}

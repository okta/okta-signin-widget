import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const CODE_FIELD_NAME = 'credentials.passcode';

export default class EnrollGoogleAuthenticatorPageObject extends BasePageObject {

  constructor(t) {
    super(t);
  }

  getBarcodeSubtitle() {
    return this.getTextContent('.barcode-setup-title');
  }

  getmanualSetupSubtitle() {
    return this.getTextContent('.manual-setup-title');
  }

  isEnterCodeSubtitleVisible() {
    return this.form.getElement('.enter-code-title').visible;
  }

  getSetUpDescription() {
    return this.getTextContent('.google-authenticator-setup-info');
  }

  hasQRcode() {
    return this.form.elementExist('.qrcode');
  }

  getSharedSecret() {
    return this.form.getElement('.shared-secret input').getAttribute('placeholder');
  }

  async goTomanualSetup() {
    await this.form.clickElement('.cannot-scan-link');
  }

  async goToNextPage() {
    await this.form.clickElement('.google-authenticator-next');
  }

  async submit() {
    await this.form.clickElement('.google-authenticator-verify');
  }

  getOtpLabel() {
    return this.form.getFormFieldLabel(CODE_FIELD_NAME);
  }

  enterCode(value) {
    return this.form.setTextBoxValue(CODE_FIELD_NAME, value);
  }

  getCodeFieldError() {
    return this.form.getTextBoxErrorMessage(CODE_FIELD_NAME);
  }

  getNextButton() {
    if (userVariables.v3) {
      return this.form.getButton('Next');
    }
    return this.form.getElement('.google-authenticator-next');
  }
}

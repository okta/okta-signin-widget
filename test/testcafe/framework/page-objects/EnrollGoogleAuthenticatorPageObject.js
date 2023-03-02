import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';

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
    if (userVariables.v3) {
      return this.form.fieldByLabelExists('Enter code');
    }
    return this.form.getElement('.enter-code-title').visible;
  }

  getSetUpDescription() {
    if (userVariables.v3) {
      return this.getTextContent('[data-se="o-form-explain"]');
    }
    return this.getTextContent('.google-authenticator-setup-info');
  }

  hasQRcode() {
    if (userVariables.v3) {
      return this.form.elementExist('.qrImg');
    }
    return this.form.elementExist('.qrcode');
  }

  getSharedSecret() {
    if (userVariables.v3) {
      return this.form.getSubtitle(1);
    }
    return this.form.getElement('.shared-secret input').getAttribute('placeholder');
  }

  async goTomanualSetup() {
    if (userVariables.v3) {
      return this.form.clickButton('Can\'t scan barcode?');
    }
    await this.form.clickElement('.cannot-scan-link');
  }

  async goToNextPage() {
    if (userVariables.v3) {
      return this.form.clickButton('Next');
    }
    await this.form.clickElement('.google-authenticator-next');
  }

  async submit() {
    if (userVariables.v3) {
      return this.form.clickButton('Verify');
    }
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

  clickVerifyButton() {
    return this.form.clickButton('Verify');
  }

}

import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';

const PASSCODE_FIELD_NAME = 'credentials.passcode';
const PHONE_NUMBER_SELECTOR = '.phone-authenticator-enroll__phone';
const PHONE_NUMBER_EXTENSION_SELECTOR = '.phone-authenticator-enroll__phone-ext';
const phoneFieldName = 'authenticator\\.phoneNumber';
const RESEND_VIEW_SELECTOR = '.phone-authenticator-enroll--warning';

export default class EnrollAuthenticatorPhonePageObject extends BasePageObject {

  constructor(t) {
    super (t);
  }

  clickRadio(methodType = 'voice') {
    return this.form.selectRadioButtonOptionByValue('authenticator\\.methodType', methodType);
  }

  extensionIsHidden() {
    if (userVariables.v3) {
      return !this.form.fieldByLabelExists('Extension');
    }
    return this.form.getElement(PHONE_NUMBER_EXTENSION_SELECTOR).hasClass('hide');
  }

  extensionText() {
    if (userVariables.v3) {
      return this.form.getElement('label[for="phoneExtension"]').innerText;
    }
    return this.form.getElement(PHONE_NUMBER_EXTENSION_SELECTOR).innerText;
  }

  countryCodeText() {
    if (userVariables.v3) {
      return this.form.getElement('[data-se="authenticator.phoneNumber"]').parent('div').innerText;
    }
    return this.form.getElement('.phone-authenticator-enroll__phone-code').innerText;
  }


  getElement(selector) {
    return this.form.getElement(selector);
  }

  hasPhoneNumberError() {
    return this.form.hasTextBoxErrorMessage(phoneFieldName);
  }

  clickSaveButton(name) {
    if (userVariables.v3) {
      return this.form.clickSaveButton(name);
    }
    return this.form.clickSaveButton();
  }

  waitForError() {
    return this.form.waitForErrorBox();
  }

  fillPhoneNumber(value) {
    return this.form.setTextBoxValue(phoneFieldName, value);
  }

  phoneNumberFieldIsSmall() {
    if (userVariables.v3) {
      return this.form.elementExist('[inputmode="tel"]');
    }
    return this.form.getElement(PHONE_NUMBER_SELECTOR)
      .hasClass('phone-authenticator-enroll__phone--small');
  }

  clickNextButton() {
    return this.form.clickSaveButton('Verify');
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getInvalidOTPError() {
    return this.form.getErrorBoxText();
  }

  getInvalidOTPFieldError() {
    return this.form.getTextBoxErrorMessage(PASSCODE_FIELD_NAME);
  }
  
  resendCodeText(index) {
    if (userVariables.v3) {
      if (index === undefined) {
        index = 0;
      }
      return this.form.getErrorBoxTextByIndex(index);
    }
    return this.form.getElement(RESEND_VIEW_SELECTOR).innerText;
  }

  async resendCodeExists(index) {
    if (userVariables.v3) {
      if (index === undefined) {
        index = 0;
      }
      return this.form.hasAlertBox(index);
    }

    const isHidden = await this.form.getElement(RESEND_VIEW_SELECTOR).hasClass('hide')
    return !isHidden;
  }
}

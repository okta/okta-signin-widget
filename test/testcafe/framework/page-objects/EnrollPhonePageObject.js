import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

const PASSCODE_FIELD_NAME = 'credentials.passcode';
const PHONE_NUMBER_EXTENSION_SELECTOR = '.phone-authenticator-enroll__phone-ext';
const PHONE_FIELD_NAME = 'authenticator\\.phoneNumber';
const PHONE_CODE_FIELD_NAME = 'phoneCode';
const RESEND_VIEW_SELECTOR = '.phone-authenticator-enroll--warning';
const PHONE_NUMBER_COUNTRY_CODE = '.phone-authenticator-enroll__phone-code';

export default class EnrollAuthenticatorPhonePageObject extends BasePageObject {

  constructor(t) {
    super (t);
  }

  clickRadio(methodType = 'voice') {
    return this.form.selectRadioButtonOptionByValue('authenticator\\.methodType', methodType);
  }

  async extensionIsHidden() {
    if (userVariables.gen3) {
      const exists = await this.form.fieldByLabelExists('Extension');
      return !exists;
    }
    const display = await this.form.getElement(PHONE_NUMBER_EXTENSION_SELECTOR).getStyleProperty('display');
    return display === 'none';
  }

  getElement(selector) {
    return this.form.getElement(selector);
  }

  hasPhoneNumberError() {
    if (userVariables.gen3) {
      return this.form.hasTextBoxErrorMessage(PHONE_FIELD_NAME);    
    }
    return this.form.hasTextBoxErrorMessage(PHONE_CODE_FIELD_NAME);
  }

  clickSaveButton(name) {
    if (userVariables.gen3) {
      return this.form.clickSaveButton(name);
    }
    return this.form.clickSaveButton();
  }

  waitForError() {
    return this.form.waitForErrorBox();
  }

  getCountryCodeValue() {
    if (userVariables.gen3) {
      return within(this.form.el).findByLabelText('Phone number').parent('div').innerText;
    }
    return this.form.getElement(PHONE_NUMBER_COUNTRY_CODE).innerText;
  }

  fillPhoneNumber(value) {
    return this.form.setTextBoxValue(PHONE_FIELD_NAME, value);
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
    if (userVariables.gen3) {
      if (index === undefined) {
        index = 0;
      }
      return this.form.getErrorBoxTextByIndex(index);
    }
    return this.form.getElement(RESEND_VIEW_SELECTOR).innerText;
  }

  async resendCodeExists(index) {
    if (userVariables.gen3) {
      if (index === undefined) {
        index = 0;
      }
      return this.form.hasAlertBox(index);
    }

    const isHidden = await this.form.getElement(RESEND_VIEW_SELECTOR).hasClass('hide');
    return !isHidden;
  }

  formFieldExistsByLabel(label) {
    return this.form.fieldByLabelExists(label);
  }

}

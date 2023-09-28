import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const PHONE_FIELD = 'phoneNumber';
const COUNTRY_FIELD = 'country';
const COUNTRY_CODE_LABEL = '.country-code-label';
const SWITCH_CHANNEL_TEXT = '.switch-channel-text';

export default class EnrollOVViaEmailPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasCountryField() {
    return this.form.findFormFieldInput(COUNTRY_FIELD).visible;
  }

  fillPhoneField(value) {
    return this.form.setTextBoxValue(PHONE_FIELD, value);
  }

  getCountryLabel() {
    if (userVariables.gen3) {
      return this.form.getElement('#phoneNumber').parent('div').textContent;
    }
    return this.form.getElement(COUNTRY_CODE_LABEL).innerText;
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  clickSendSetupLink() {
    if (userVariables.gen3) {
      return this.form.clickButton('Send me the setup link');
    }
    return this.form.clickSaveButton();
  }

  hasSwitchChannelText() {
    return this.form.getElement(SWITCH_CHANNEL_TEXT).visible;
  }
}

import BasePageObject from './BasePageObject';

const EMAIL_FIELD = 'email';
const SWITCH_CHANNEL_TEXT = '.switch-channel-text';

export default class EnrollOVViaEmailPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  fillEmailField(value) {
    return this.form.setTextBoxValue(EMAIL_FIELD, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  hasSwitchChannelText() {
    return this.form.getElement(SWITCH_CHANNEL_TEXT).visible;
  }
}

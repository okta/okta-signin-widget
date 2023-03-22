import { Selector, userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const RESEND_NUMBER_CHALLENGE_BUTTON = '.okta-form-infobox-warning .resend-number-challenge';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FORM_SELECTOR = '.okta-verify-send-push-form';
const FORM_SELECTOR_V3 = '.mfa-okta-verify';
const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name$="autoChallenge"]';
const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name$="autoChallenge"]';
const FACTOR_BEACON = '.auth-beacon.auth-beacon-factor';
const RESEND_PUSH_NOTIFICATION_TEXT = 'Resend push notification';
export default class ChallengeOktaVerifyPushPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
    this.beacon = new Selector('.beacon-container');
  }

  getPushButton() {
    return this.form.getElement('.send-push');
  }

  getA11ySpan() {
    return this.form.getElement('.accessibility-text');
  }

  getResendPushButton() {
    if (userVariables.v3) {
      return this.form.getButton(RESEND_PUSH_NOTIFICATION_TEXT)
    }
    return this.form.getElement('.button-primary');
  }

  clickResendPushButton() {
    if (userVariables.v3) {
      return this.form.clickSaveButton(RESEND_PUSH_NOTIFICATION_TEXT)
    }
    return this.form.clickSaveButton();
  }

  clickResendNumberChallenge() {
    return this.form.clickElement(RESEND_NUMBER_CHALLENGE_BUTTON);
  }

  async waitForErrorBox() {
    await this.form.waitForErrorBox();
  }

  getErrorBox() {
    return this.form.getErrorBox();
  }

  getErrorTitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  getWarningBox() {
    if (userVariables.v3) {
      return this.form.getAlertBox();
    }

    return this.form.getElement(FORM_INFOBOX_WARNING);
  }

  async autoChallengeInputExists() {
    return this.form.elementExist(AUTO_CHALLENGE_CHECKBOX_SELECTOR);
  }

  getAutoChallengeCheckboxLabel() {
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  }

  async clickAutoChallengeCheckbox() {
    await this.t.click(this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR));
  }

  async  isOktaVerifySendPushForm() {
    let formCount;
    if (userVariables.v3) {
      formCount = await Selector(FORM_SELECTOR_V3).count;   
    } else {
      formCount = await Selector(FORM_SELECTOR).count;
    }
    return formCount === 1;
  }

  async clickSendPushButton() {
    if (userVariables.v3) {
      return await this.form.clickSaveButton('Send push');
    }
    await this.form.clickSaveButton();
  }

  getBeaconClass() {
    return this.beacon.find(FACTOR_BEACON).getAttribute('class');
  }

  getAutoPushCheckbox() {
    return this.form.getCheckbox('Send push automatically');
  }

  getAutoPushValue() {
    return this.getAutoPushCheckbox().checked;
  }

  getNthErrorBulletPoint(index) {
    const alertBox = this.form.getAlertBox();
    const listItems = within(alertBox).getAllByRole('listitem');
    return listItems.nth(index).innerText;
  }
}

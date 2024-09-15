import { Selector, userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const RESEND_NUMBER_CHALLENGE_BUTTON = '.okta-form-infobox-warning .resend-number-challenge';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FORM_SELECTOR = '.okta-verify-send-push-form';
const FORM_SELECTOR_V3 = '[data-se~="mfa-okta-verify"]';
const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name$="autoChallenge"]';
const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name$="autoChallenge"]';
const FACTOR_BEACON = '.auth-beacon.auth-beacon-factor';
const RESEND_PUSH_NOTIFICATION_TEXT = 'Resend push notification';
export default class ChallengeOktaVerifyPushPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
    if (userVariables.gen3) {
      this.beacon = new Selector('[data-se~="factor-beacon"]');
    } else {
      this.beacon = new Selector('.beacon-container');
    }
  }

  getPushButton() {
    if (userVariables.gen3) {
      return this.form.getButton('Push notification sent');
    }
    return this.form.getElement('.send-push');
  }

  async isPushButtonDisabled() {
    const pushBtnClass = await this.getPushButton().getAttribute('class');
    return pushBtnClass.includes('disabled');
  }

  getA11ySpan() {
    return this.form.getElement('.accessibility-text');
  }

  getResendPushButton() {
    if (userVariables.gen3) {
      return this.form.getButton(RESEND_PUSH_NOTIFICATION_TEXT);
    }
    return this.form.getElement('.button-primary');
  }

  clickResendPushButton() {
    if (userVariables.gen3) {
      return this.form.clickSaveButton(RESEND_PUSH_NOTIFICATION_TEXT);
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
    if (userVariables.gen3) {
      return this.form.getNthTitle(0);
    }
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE).innerText;
  }

  getFormTitleWithError() {
    const titlePosition = userVariables.gen3 ? 1 : 0;
    return this.form.getNthTitle(titlePosition);
  }

  getWarningBox() {
    if (userVariables.gen3) {
      return this.form.getAlertBox();
    }

    return this.form.getElement(FORM_INFOBOX_WARNING);
  }

  async autoChallengeInputExists() {
    return this.form.elementExist(AUTO_CHALLENGE_CHECKBOX_SELECTOR);
  }

  getAutoChallengeCheckbox() {
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_SELECTOR);
  }

  getAutoChallengeCheckboxLabelText() {
    let label = '';
    if (userVariables.gen3) {
      label = this.form.el
        .find('input[type="checkbox"]')
        .parent('span')
        .parent('label')
        .textContent;
    } else {
      label = this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR).textContent;
    }

    return label;
  }

  getAutoChallengeCheckboxLabel() {
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  }

  async clickAutoChallengeCheckbox() {
    await this.form.clickCheckboxElement(this.getAutoChallengeCheckbox());
  }

  async isOktaVerifySendPushForm() {
    let formCount;
    if (userVariables.gen3) {
      formCount = await Selector(FORM_SELECTOR_V3).count;   
    } else {
      formCount = await Selector(FORM_SELECTOR).count;
    }
    return formCount === 1;
  }

  async clickSendPushButton() {
    if (userVariables.gen3) {
      return await this.form.clickSaveButton('Send push');
    }
    await this.form.clickSaveButton();
  }

  getBeaconSelector() {
    if (userVariables.gen3) {
      return this.beacon.getAttribute('data-se');
    }
    return this.beacon.find(FACTOR_BEACON).getAttribute('class');
  }

  getAutoPushCheckbox() {
    return this.form.getCheckbox('Send push automatically');
  }

  getAutoPushValue() {
    return this.getAutoPushCheckbox().checked;
  }

  getNthErrorBulletPoint(index) {
    if (userVariables.gen3) {
      const alertBox = this.form.getAlertBox();
      const listItems = within(alertBox).getAllByRole('listitem');
      return listItems.nth(index).innerText;
    }
    return this.getErrorBox().innerText;
  }
}

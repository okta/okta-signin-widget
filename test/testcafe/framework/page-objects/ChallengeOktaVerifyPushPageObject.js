import { Selector, userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const FORM_INFOBOX_WARNING = '.okta-form-infobox-warning';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const RESEND_NUMBER_CHALLENGE_BUTTON = '.okta-form-infobox-warning .resend-number-challenge';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FORM_SELECTOR = '.okta-verify-send-push-form';
const FORM_SELECTOR_V3 = '.mfa-okta-verify';
const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name$="autoChallenge"]';
const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name$="autoChallenge"]';
const FACTOR_BEACON = '.auth-beacon.auth-beacon-factor';
const INFOBOX_WARNING_V3 = '[role="alert"]';
export default class ChallengeOktaVerifyPushPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
    if (userVariables.v3) {
      this.beacon = new Selector('[data-se="factor-beacon"]');
    } else {
      this.beacon = new Selector('.beacon-container');
    }
  }

  getPushButton() {
    if (userVariables.v3) {
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
    return this.form.getElement('.button-primary');
  }

  clickResendPushButton() {
    return this.form.clickSaveButton();
  }

  async clickResendNumberChallenge() {
    if (userVariables.v3) {
      return this.form.clickElement('a');
    }
    return this.form.clickElement(RESEND_NUMBER_CHALLENGE_BUTTON);
  }

  async waitForErrorBox() {
    await this.form.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBox() {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }

  getErrorTitle() {
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  getWarningBox() {
    if (userVariables.v3) {
      return this.form.getElement(INFOBOX_WARNING_V3);
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
    if (userVariables.v3) {
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


  async clickAutoChallengeCheckbox() {
    await this.t.click(this.form.getElement(AUTO_CHALLENGE_CHECKBOX_SELECTOR));
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
    if (userVariables.v3) {
      return this.beacon.getAttribute('class');
    }
    return this.beacon.find(FACTOR_BEACON).getAttribute('class');
  }

  getAutoPushCheckbox() {
    return this.form.getCheckbox('Send push automatically');
  }

  getAutoPushValue() {
    return this.getAutoPushCheckbox().checked;
  }
}

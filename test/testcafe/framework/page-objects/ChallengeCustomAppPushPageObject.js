import { Selector, userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';
import { queryByLabelText } from '@testing-library/dom';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name$="autoChallenge"]';
const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name$="autoChallenge"]';
const FACTOR_BEACON = '.auth-beacon.auth-beacon-factor';
const FORM_SELECTOR = '.custom-app-send-push-form';

export default class ChallengeCustomAppPushPageObject extends ChallengeFactorPageObject {
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
    return this.form.getLink('Push notification sent');
  }

  isPushButtonDisabled() {
    const pushBtn = this.getPushButton();
    if (userVariables.v3) {
      return pushBtn.hasAttribute('disabled');
    }
    return pushBtn.hasClass('link-button-disabled');
  }

  isResendPushButtonDisabled() {
    const pushBtn = this.getResendPushButton();
    if (userVariables.v3) {
      return pushBtn.hasAttribute('disabled');
    }
    return pushBtn.hasClass('link-button-disabled');
  }

  async  isCustomAppSendPushForm() {
    const formCount = await Selector(FORM_SELECTOR).count;
    return formCount === 1;
  }

  getA11ySpan() {
    return this.form.getElement('.accessibility-text');
  }

  getResendPushButton() {
    if (userVariables.v3) {
      return this.form.getButton('Resend push notification');
    }
    return this.form.getElement('.button-primary');
  }

  getResendPushButtonText() {
    if (userVariables.v3) {
      return this.getResendPushButton().textContent;
    }
    return this.getResendPushButton().value;
  }

  clickResendPushButton() {
    return this.form.clickButton('Resend push notification');
  }

  async waitForErrorBox() {
    await this.form.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBox() {
    return this.form.getErrorBox();
  }

  getErrorTitle() {
    if (userVariables.v3) {
      return this.getErrorBox();
    }
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  getWarningBox() {
    return this.form.getAlertBox();
  }

  async autoChallengeInputExists() {
    if (userVariables.v3) {
      return this.form.getCheckbox('Send push automatically').exists;
    }
    return this.form.elementExist(AUTO_CHALLENGE_CHECKBOX_SELECTOR);
  }

  async autoChallengeInputIsVisible() {
    if (userVariables.v3) {
      return this.autoChallengeInputExists();
    }
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_SELECTOR).visible;
  }

  getAutoChallengeCheckBox() {
    if (userVariables.v3) {
      return queryByLabelText('Send push automatically');
    }
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  }

  getAutoChallengeCheckboxLabel() {
    if (userVariables.v3) {
      return this.form.getCheckbox('Send push automatically');
    }
    return this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  }

  isAutoChallengeChecked() {
    const checkboxLabel = this.getAutoChallengeCheckboxLabel();
    if (userVariables.v3) {
      return checkboxLabel.checked;
    }
    return checkboxLabel.hasClass('checked');
  }

  async clickAutoChallengeCheckbox() {
    if (userVariables.v3) {
      await this.t.click(this.form.getCheckbox('Send push automatically'));
    } else {
      await this.t.click(this.form.getElement(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR));
    }
  }

  getBeaconClass() {
    if (userVariables.v3) {
      return this.beacon.getAttribute('class');
    }
    return this.beacon.find(FACTOR_BEACON).getAttribute('class');
  }

  getBeaconBgImage() {
    if (userVariables.v3) {
      return within(this.beacon).getByRole('img', {
        name: 'Redirect to a third party MFA provider to sign in.',
        hidden: true
      }).getAttribute('src');
    }
    return this.beacon.find(FACTOR_BEACON).getStyleProperty('background-image');
  }
}

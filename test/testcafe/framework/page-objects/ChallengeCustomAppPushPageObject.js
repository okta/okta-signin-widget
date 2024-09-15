import { Selector, userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';
import { within } from '@testing-library/testcafe';

const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const FACTOR_BEACON = '.auth-beacon.auth-beacon-factor';
const FORM_SELECTOR = '.custom-app-send-push-form';

export default class ChallengeCustomAppPushPageObject extends ChallengeFactorPageObject {
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
    return this.form.getLink('Push notification sent');
  }

  isPushButtonDisabled() {
    const pushBtn = this.getPushButton();
    // v3 button uses disabled prop and v2 uses disabled class
    if (userVariables.gen3) {
      return pushBtn.hasAttribute('disabled');
    }
    return pushBtn.hasClass('link-button-disabled');
  }

  isResendPushButtonDisabled() {
    const pushBtn = this.getResendPushButton();
    // v3 button uses disabled prop and v2 uses disabled class
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      return this.form.getButton('Resend push notification');
    }
    return this.form.getElement('.button-primary');
  }

  getResendPushButtonText() {
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      return this.getErrorBox();
    }
    return this.form.getElement(FORM_INFOBOX_ERROR_TITLE);
  }

  getWarningBox() {
    return this.form.getAlertBox();
  }

  async autoChallengeInputExists() {
    return this.form.getCheckbox('Send push automatically').exists;
  }

  async autoChallengeInputIsVisible() {
    return this.autoChallengeInputExists();
  }

  getAutoChallengeCheckboxLabel() {
    return this.form.getCheckbox('Send push automatically');
  }

  isAutoChallengeChecked() {
    return this.getAutoChallengeCheckboxLabel().checked;
  }

  async clickAutoChallengeCheckbox() {
    await this.form.clickCheckboxElement(this.form.getCheckbox('Send push automatically'));
  }

  getBeaconSelector() {
    if (userVariables.gen3) {
      return this.beacon.getAttribute('data-se');
    }
    return this.beacon.find(FACTOR_BEACON).getAttribute('class');
  }

  getBeaconBgImage() {
    if (userVariables.gen3) {
      return within(this.beacon).getByRole('img', {
        name: 'Redirect to a third party MFA provider to sign in.',
        hidden: true
      }).getAttribute('src');
    }
    return this.beacon.find(FACTOR_BEACON).getStyleProperty('background-image');
  }
}

import { userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const PASSCODE_FIELD_NAME = 'credentials.passcode';
const CONFIRM_PIN_FIELD_NAME = 'confirmPassword';

export default class ChallengeNfcPinPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  // PIN field interactions
  fillPin(value) {
    return this.form.setTextBoxValue(PASSCODE_FIELD_NAME, value);
  }

  fillConfirmPin(value) {
    return this.form.setTextBoxValue(CONFIRM_PIN_FIELD_NAME, value);
  }

  getPinValue() {
    return this.form.getTextBoxValue(PASSCODE_FIELD_NAME);
  }

  // Error messages
  getPinError() {
    return this.form.getTextBoxErrorMessage(PASSCODE_FIELD_NAME);
  }

  getConfirmPinError() {
    return this.form.getTextBoxErrorMessage(CONFIRM_PIN_FIELD_NAME);
  }

  // Open Okta Verify button
  getOpenOktaVerifyButton() {
    return this.form.getButton('Open Okta Verify');
  }

  openOktaVerifyButtonExists() {
    if (userVariables.gen3) {
      return this.form.getButton('Open Okta Verify').exists;
    }
    return this.form.elementExist('#launch-ov');
  }

  clickOpenOktaVerifyButton() {
    return this.form.clickButton('Open Okta Verify');
  }

  // Forgot PIN link (getLink uses screen.queryByRole which works for both v2 and v3)
  forgotPinLinkExists() {
    return this.form.getLink('Forgot PIN?').exists;
  }

  getForgotPinLinkText() {
    return this.form.getLink('Forgot PIN?').textContent;
  }

  // Switch authenticator link
  switchAuthenticatorExists() {
    return this.form.getLink('Verify with something else').exists;
  }

  getSwitchAuthenticatorText() {
    return this.form.getLink('Verify with something else').textContent;
  }

  // Return to authenticator list link
  returnToAuthenticatorListLinkExists() {
    if (userVariables.gen3) {
      return this.form.elementExist('[data-se="switchAuthenticator"]');
    }
    return this.form.elementExist('.js-switchAuthenticator');
  }

  // Requirements section
  requirementsExist() {
    return this.form.elementExist('[data-se="password-authenticator--rules"]');
  }

  // Submit
  clickVerifyButton() {
    return this.form.clickSaveButton('Verify');
  }

  clickNextButton() {
    if (userVariables.gen3) {
      return this.form.clickSaveButton('Next');
    }
    return this.form.clickSaveButton();
  }
}

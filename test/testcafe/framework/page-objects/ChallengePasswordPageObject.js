import { Selector } from 'testcafe';

import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const FORGOT_PASSWORD_SELECTOR = '[data-se="forgot-password"]';
const PASSWORD_FIELD = 'credentials\\.passcode';
const SUB_LABEL_SELECTOR = '.o-form-explain';

export default class ChallengePasswordPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getPasswordFieldErrorMessage() {
    return this.form.getTextBoxErrorMessage(PASSWORD_FIELD);
  }

  getPasswordSubLabelValue() {
    return Selector(SUB_LABEL_SELECTOR).nth(0).textContent;
  }

  getForgotPasswordLabelValue() {
    return Selector(FORGOT_PASSWORD_SELECTOR).nth(0).textContent;
  }
}

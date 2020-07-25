import ChallengeFactorPageObject from './ChallengeFactorPageObject';
import FooterLinkObject from './components/FooterLinkObject';

const FORGOT_PASSWORD_SELECTOR = '.auth-footer .js-forgot-password';
const PASSWORD_FIELD = 'credentials\\.passcode';

export default class ChallengePasswordPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);

    this.forgotPasswordLink = new FooterLinkObject(t, FORGOT_PASSWORD_SELECTOR);
  }

  getPasswordFieldErrorMessage() {
    return this.form.getTextBoxErrorMessage(PASSWORD_FIELD);
  }

}

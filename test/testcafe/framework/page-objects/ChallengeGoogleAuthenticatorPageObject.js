import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const OTP_FIELD = 'credentials.passcode';

export default class ChallengeGoogleAuthenticatorPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getOtpLabel() {
    return this.form.getFormFieldLabel(OTP_FIELD);
  }

  getAnswerInlineError() {
    return this.form.getTextBoxErrorMessage(OTP_FIELD);
  }
}

import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const OTP_FIELD = 'credentials.otp';

export default class ChallengeGoogleAuthenticatorPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getOtpLabel() {
    return this.form.getFormFieldLabel(OTP_FIELD);
  }

}

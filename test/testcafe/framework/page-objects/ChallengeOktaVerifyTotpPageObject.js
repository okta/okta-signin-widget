import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const TOTP_FIELD = 'credentials.totp';

export default class ChallengeOktaVerifyTotpPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getTotpLabel() {
    return this.form.getFormFieldLabel(TOTP_FIELD);
  }

}

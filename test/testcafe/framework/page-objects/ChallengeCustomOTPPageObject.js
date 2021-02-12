import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const PASSCODE_FIELD_NAME = 'credentials.otp';

export default class ChallengeCustomOTPPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getPasscodeValue() {
    return this.form.getTextBoxValue(PASSCODE_FIELD_NAME);
  }

  getPasscodeError() {
    return this.form.getTextBoxErrorMessage(PASSCODE_FIELD_NAME);
  }

}

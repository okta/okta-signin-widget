import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const PASSCODE_FIELD_NAME = 'credentials.passcode';

export default class ChallengeOnPremPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getPasscodeValue() {
    return this.form.getTextBoxValue(PASSCODE_FIELD_NAME);
  }

  getPasscodeError() {
    return this.form.getTextBoxErrorMessage(PASSCODE_FIELD_NAME);
  }

  passcodeFieldType() {
    return this.form.getElement(`input[name="${PASSCODE_FIELD_NAME}"]`).attr('type');
  }

}

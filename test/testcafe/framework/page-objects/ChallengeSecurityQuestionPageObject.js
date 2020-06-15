import BasePageObject from './BasePageObject';

const ANSWER_FIELD = 'credentials.answer';

export default class ChallengeSecurityQuestionPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getAnswerLabel() {
    return this.form.getFormFieldLabel(ANSWER_FIELD);
  }

  setAnswerValue(value) {
    return this.form.setTextBoxValue(ANSWER_FIELD, value);
  }

  clickVerifyButton() {
    return this.form.clickSaveButton();
  }

}

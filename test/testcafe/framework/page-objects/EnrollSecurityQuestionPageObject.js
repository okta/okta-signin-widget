import BasePageObject from './BasePageObject';

const ANSWER_FIELD = 'credentials.answer';
const QUESTION_FIELD = 'credentials.question';
const QUESTION_KEY_FIELD = 'credentials.questionKey';

export default class EnrollSecurityQuestionPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickChooseSecurityQuestion() {
    return this.form.selectRadioButtonOption("sub_schema_local_credentials", 0);
  }

  clickCreateYouOwnQuestion() {
    return this.form.selectRadioButtonOption("sub_schema_local_credentials", 1);
  }

  selectSecurityQuestion(index) {
    return this.form.selectValueChozenDropdown(QUESTION_KEY_FIELD, index);
  }

  setMyOwnSecurityQuestion(question) {
    return this.form.setTextBoxValue(QUESTION_FIELD, question);
  }

  setAnswerValue(value) {
    return this.form.setTextBoxValue(ANSWER_FIELD, value);
  }

  clickVerifyButton() {
    return this.form.clickSaveButton();
  }

}

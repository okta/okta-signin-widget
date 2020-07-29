import BasePageObject from './BasePageObject';

const ANSWER_FIELD = 'credentials.answer';
const QUESTION_FIELD = 'credentials.question';
const QUESTION_KEY_FIELD = 'credentials.questionKey';

export default class EnrollSecurityQuestionPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickChooseSecurityQuestion() {
    return this.form.selectRadioButtonOption('sub_schema_local_credentials', 0);
  }

  clickCreateYouOwnQuestion() {
    return this.form.selectRadioButtonOption('sub_schema_local_credentials', 1);
  }

  selectSecurityQuestion(index) {
    return this.form.selectValueChozenDropdown(QUESTION_KEY_FIELD, index);
  }

  isSecurityQuestionDropdownVisible() {
    return this.form.findFormFieldInput(QUESTION_KEY_FIELD).visible;
  }

  setMyOwnSecurityQuestion(question) {
    return this.form.setTextBoxValue(QUESTION_FIELD, question);
  }

  isCreateMyOwnSecurityQuestionTextBoxVisible() {
    return this.form.findFormFieldInput(QUESTION_FIELD).visible;
  }

  setAnswerValue(value) {
    return this.form.setTextBoxValue(ANSWER_FIELD, value);
  }

  getAnswerInlineError() {
    return this.form.getTextBoxErrorMessage(ANSWER_FIELD);
  }

  clickVerifyButton() {
    return this.form.clickSaveButton();
  }

}

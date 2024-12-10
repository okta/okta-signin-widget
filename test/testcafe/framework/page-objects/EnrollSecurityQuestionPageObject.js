import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const ANSWER_FIELD = 'credentials.answer';
const QUESTION_FIELD = 'credentials.question';
const QUESTION_KEY_FIELD = 'credentials.questionKey';
const QUESTION_TYPE = 'questionType';

export default class EnrollSecurityQuestionPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickChooseSecurityQuestion() {
    if (userVariables.gen3) {
      return this.form.selectRadioButtonOptionByValue('','predefined');
    }
    return this.form.selectRadioButtonOption('sub_schema_local_credentials', 0);
  }

  clickCreateYouOwnQuestion() {
    if (userVariables.gen3) {
      return this.form.selectRadioButtonOptionByValue('', 'custom');
    }
    return this.form.selectRadioButtonOption('sub_schema_local_credentials', 1);
  }

  selectSecurityQuestion(index) {
    // In v3 widget, "Choose a security question" is also a value in dropdown
    // We need to skip that value, by increasing the index by 1
    if (userVariables.gen3) {
      index = index + 1;
    }
    return this.form.selectValueChozenDropdown(QUESTION_KEY_FIELD, index);
  }

  openSecurityQuestionDropdown() {
    return this.form.openChozenDropdown(QUESTION_KEY_FIELD);
  }

  isSecurityQuestionDropdownVisible() {
    return this.form.findFormFieldInput(QUESTION_KEY_FIELD).visible;
  }

  isSecurityQuestionDropdownOpened() {
    return this.form.isChozenDropdownOpened();
  }

  isSecurityQuestionTypeSelectVisible() {
    return this.form.findFormFieldInput(QUESTION_TYPE).visible;
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
    return this.form.clickButton('Verify');
  }

}

import Form from './Form';
const ANSWER_FIELD = 'answer';
const SHOW_ANSWER_FIELD = 'showAnswer';
const CLASS_SELECTOR = '.recovery-question';
const BACK_TO_LOGIN_BTN = 'back-button';
export default Form.extend({
  isRecoveryQuestion: function() {
    return this.$(CLASS_SELECTOR).length === 1;
  },

  answerField: function() {
    return this.input(ANSWER_FIELD);
  },

  setAnswer: function(val) {
    const field = this.answerField();

    field.val(val);
    field.trigger('change');
  },

  showAnswerCheckbox: function() {
    return this.checkbox(SHOW_ANSWER_FIELD);
  },

  showAnswerLabelText: function() {
    return this.checkboxLabelText(SHOW_ANSWER_FIELD);
  },

  showAnswerCheckboxStatus: function() {
    const isChecked = this.showAnswerCheckbox().prop('checked');

    return isChecked ? 'checked' : 'unchecked';
  },

  setShowAnswer: function(val) {
    const showAnswer = this.showAnswerCheckbox();

    showAnswer.prop('checked', val);
    showAnswer.trigger('change');
  },

  signoutLink: function() {
    return this.el('signout-link');
  },

  // unlock confirmation form

  backToLoginButton: function() {
    return this.el(BACK_TO_LOGIN_BTN);
  },

  goBackToLogin: function() {
    this.backToLoginButton().click();
  },
});

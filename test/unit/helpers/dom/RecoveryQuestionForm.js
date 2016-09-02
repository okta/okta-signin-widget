define(['./Form'], function (Form) {

  var ANSWER_FIELD = 'answer';
  var SHOW_ANSWER_FIELD = 'showAnswer';
  var CLASS_SELECTOR = '.recovery-question';
  var BACK_TO_LOGIN_BTN = 'back-button';

  return Form.extend({

    isRecoveryQuestion: function () {
      return this.$(CLASS_SELECTOR).length === 1;
    },

    answerField: function () {
      return this.input(ANSWER_FIELD);
    },

    setAnswer: function (val) {
      var field = this.answerField();
      field.val(val);
      field.trigger('change');
    },

    showAnswerCheckbox: function () {
      return this.checkbox(SHOW_ANSWER_FIELD);
    },

    showAnswerLabelText: function () {
      return this.checkboxLabelText(SHOW_ANSWER_FIELD);
    },

    showAnswerCheckboxStatus: function () {
      var isChecked = this.showAnswerCheckbox().prop('checked');
      return isChecked ? 'checked' : 'unchecked';
    },

    setShowAnswer: function (val) {
      var showAnswer = this.showAnswerCheckbox();
      showAnswer.prop('checked', val);
      showAnswer.trigger('change');
    },

    signoutLink: function () {
      return this.el('signout-link');
    },

    // unlock confirmation form

    backToLoginButton: function () {
      return this.el(BACK_TO_LOGIN_BTN);
    },

    goBackToLogin: function () {
      this.backToLoginButton().click();
    }
    
  });

});

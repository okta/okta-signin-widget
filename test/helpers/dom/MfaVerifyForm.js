define(['./Form'], function (Form) {

  var ANSWER_FIELD = 'answer';
  var SHOW_ANSWER_FIELD = 'showAnswer';

  return Form.extend({

    isDuo: function () {
      return this.el('factor-duo').length === 1;
    },

    isPush: function () {
      return this.el('factor-push').length === 1;
    },

    isSecurityQuestion: function () {
      return this.el('factor-question').length === 1;
    },

    isTOTP: function () {
      return this.el('factor-totp').length === 1;
    },

    isSMS: function () {
      return this.el('factor-sms').length === 1;
    },

    isInlineTOTP: function () {
      return this.el('factor-inline-totp').length === 1;
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

    smsSendCode: function () {
      return this.el('sms-send-code');
    },

    inlineTOTPVerify: function () {
      return this.el('inline-totp-verify');
    },

    inlineTOTPVerifyText: function () {
      return this.inlineTOTPVerify().trimmedText();
    },

    inlineTOTPAdd: function () {
      return this.el('inline-totp-add');
    },

    inlineTOTPAddText: function () {
      return this.inlineTOTPAdd().trimmedText();
    },

    iframe: function () {
      return this.$('iframe');
    },

    passCodeErrorField: function () {
      return this.error('answer');
    },

    getAutocomplete: function () {
      return this.autocomplete(ANSWER_FIELD);
    }

  });

});

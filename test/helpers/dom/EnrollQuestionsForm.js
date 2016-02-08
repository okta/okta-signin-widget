define(['./Form'], function (Form) {

  var ANSWER_FIELD = 'answer';
  var QUESTIONS_FIELD = 'question';

  return Form.extend({

    answerField: function () {
      return this.input(ANSWER_FIELD);
    },

    setAnswer: function (val) {
      var field = this.answerField();
      field.val(val);
      field.trigger('change');
    },

    questionList: function () {
      return this.selectOptions(QUESTIONS_FIELD);
    },

    selectQuestion: function (question) {
      return this.selectOption(QUESTIONS_FIELD, question);
    },

    backLink: function () {
      return this.el('back-link');
    }

  });

});

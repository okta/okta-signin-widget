import Form from './Form';
const ANSWER_FIELD = 'answer';
const QUESTIONS_FIELD = 'question';
export default Form.extend({
  answerField: function() {
    return this.input(ANSWER_FIELD);
  },

  setAnswer: function(val) {
    const field = this.answerField();

    field.val(val);
    field.trigger('change');
  },

  getAnswerAutocomplete: function() {
    return this.autocomplete(ANSWER_FIELD);
  },

  questionList: function() {
    return this.selectOptions(QUESTIONS_FIELD);
  },

  selectQuestion: function(question) {
    return this.selectOption(QUESTIONS_FIELD, question);
  },

  backLink: function() {
    return this.el('back-link');
  },
});

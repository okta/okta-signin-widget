import Form from './Form';
const CODE_FIELD = 'passCode';
const PASSCODE_FORM = 'step-sendcode';
export default Form.extend({
  form: function() {
    return this.el(PASSCODE_FORM);
  },

  codeField: function() {
    return this.input(CODE_FIELD);
  },

  setCode: function(val) {
    const field = this.codeField();

    field.val(val);
    field.trigger('change');
  },

  backLink: function() {
    return this.el('back-link');
  },
});

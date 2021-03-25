import Form from './Form';
const CODE_FIELD = 'passCode';
export default Form.extend({
  codeField: function() {
    return this.input(CODE_FIELD);
  },

  getAutocompleteCodeField: function() {
    return this.autocomplete(CODE_FIELD);
  },

  setCode: function(val) {
    const field = this.codeField();

    field.val(val);
    field.trigger('change');
  },

  resendButton: function() {
    return this.el('resend-button');
  },

  signoutLink: function() {
    return this.el('signout-link');
  },
});

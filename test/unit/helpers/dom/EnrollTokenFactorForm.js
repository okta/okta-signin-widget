import Form from './Form';
const CRED_ID_FIELD = 'credentialId';
const CODE_FIELD = 'passCode';
const SECOND_CODE_FIELD = 'nextPassCode';
export default Form.extend({
  credentialIdField: function() {
    return this.input(CRED_ID_FIELD);
  },

  codeField: function() {
    return this.input(CODE_FIELD);
  },

  getCodeFieldAutocomplete: function() {
    return this.autocomplete(CODE_FIELD);
  },

  secondCodeField: function() {
    return this.input(SECOND_CODE_FIELD);
  },

  setCredentialId: function(val) {
    const field = this.credentialIdField();

    field.val(val);
    field.trigger('change');
  },

  getCredentialId: function() {
    const field = this.credentialIdField();

    return field.val();
  },

  setCode: function(val) {
    const field = this.codeField();

    field.val(val);
    field.trigger('change');
  },

  setSecondCode: function(val) {
    const field = this.secondCodeField();

    field.val(val);
    field.trigger('change');
  },

  backLink: function() {
    return this.el('back-link');
  },

  credIdExplain: function() {
    return this.explain(CRED_ID_FIELD);
  },

  codeExplain: function() {
    return this.explain(CODE_FIELD);
  },
});

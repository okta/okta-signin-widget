define(['./Form'], function (Form) {

  var CRED_ID_FIELD = 'credentialId';
  var CODE_FIELD = 'passCode';
  var SECOND_CODE_FIELD = 'nextPassCode';

  return Form.extend({

    credentialIdField: function () {
      return this.input(CRED_ID_FIELD);
    },

    codeField: function () {
      return this.input(CODE_FIELD);
    },

    getCodeFieldAutocomplete: function () {
      return this.autocomplete(CODE_FIELD);
    },

    secondCodeField: function () {
      return this.input(SECOND_CODE_FIELD);
    },

    setCredentialId: function (val) {
      var field = this.credentialIdField();
      field.val(val);
      field.trigger('change');
    },

    getCredentialId: function () {
      var field = this.credentialIdField();
      return field.val();
    },

    setCode: function (val) {
      var field = this.codeField();
      field.val(val);
      field.trigger('change');
    },

    setSecondCode: function (val) {
      var field = this.secondCodeField();
      field.val(val);
      field.trigger('change');
    },

    backLink: function () {
      return this.el('back-link');
    },

    credIdExplain: function () {
      return this.explain(CRED_ID_FIELD);
    },

    codeExplain: function () {
      return this.explain(CODE_FIELD);
    },

  });

});

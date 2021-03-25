import Form from '../Form';
export default Form.extend({
  getTitle: function() {
    return this.$('.siw-main-body .okta-form-title').text();
  },

  getIdentifierInput: function() {
    return this.$('.siw-main-body .o-form-fieldset-container input[type="text"]');
  },

  getFormSaveButton: function() {
    return this.$('.siw-main-body .o-form-button-bar .button-primary');
  },
});

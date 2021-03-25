import Form from './Form';
export default Form.extend({
  formTitle: function() {
    return this.$('.enroll-user .okta-form-title');
  },
  formButton: function() {
    return this.$('.enroll-user .button-primary');
  },
  formInputs: function(field) {
    return this.inputWrap(field);
  },
});

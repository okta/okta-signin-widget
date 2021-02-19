import Form from '../Form';
export default Form.extend({
  getTitle: function () {
    return this.$('.siw-main-body .okta-form-title').text();
  },

  getErrorMessages: function () {
    return this.$('.siw-main-body .o-form-error-container').text();
  }

});

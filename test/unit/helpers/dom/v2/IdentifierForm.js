define(['../Form'], function (Form) {

  return Form.extend({
  
    getTitle: function () {
      return this.$('.siw-main-body .okta-form-title').text();
    },

    getIdentifierInput: function () {
      return this.$('.siw-main-body .o-form-fieldset-container input');
    },

    getFormSaveButton: function () {
      return this.$('.siw-main-body .o-form-button-bar .button-primary');
    }
  
  });
  
});
  
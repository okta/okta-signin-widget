define(['./Form'], function (Form) {

  return Form.extend({
    pageTitle: function () {
      return this.$('.poll-controller .okta-form-title');
    },
    cancelButton: function () {
      return this.$('.poll-controller .o-form-button-bar input');
    }
  });

});

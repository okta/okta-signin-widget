define(['./Form'], function (Form) {

  return Form.extend({

    hasErrorWindowsHello: function () {
      return this.el('o-form-error-windows-hello').length == 1;
    },

    spinner: function () {
      return this.el('o-form-okta-waiting-spinner');
    },

    backLink: function () {
      return this.el('back-link');
    },

    buttonBar: function () {
      return this.$('.o-form-button-bar');
    }
  });

});

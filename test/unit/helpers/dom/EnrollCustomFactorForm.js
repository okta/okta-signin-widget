define(['./Form'], function (Form) {

  return Form.extend({

    backLink: function () {
      return this.el('back-link');
    },

    buttonBar: function () {
      return this.$('.o-form-button-bar');
    }

  });

});

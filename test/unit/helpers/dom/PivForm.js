define(['./Form'], function (Form) {

  return Form.extend({

    instructions: function () {
      return this.$('.piv-verify-text p');
    },

    spinningIcon: function () {
      return this.el('piv-waiting');
    },

    backLink: function () {
      return this.el('back-link');
    },

    errorHtml: function () {
      return this.el('o-form-error-html').find('strong');
    }
  });

});

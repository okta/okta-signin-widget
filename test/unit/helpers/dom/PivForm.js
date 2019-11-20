define(['./Form'], function (Form) {

  return Form.extend({

    instructions: function () {
      return this.$('.piv-verify-text p').trimmedText();
    },

    spinningIcon: function () {
      return this.el('piv-waiting');
    },

    backLink: function () {
      return this.el('back-link');
    }
  });

});

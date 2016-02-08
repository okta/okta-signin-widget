define(['./Form'], function (Form) {

  return Form.extend({

    backLink: function () {
      return this.el('back-link');
    },

    iframe: function () {
      return this.$('iframe');
    }

  });

});

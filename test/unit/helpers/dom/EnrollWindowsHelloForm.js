define(['./Form'], function (Form) {

  return Form.extend({

    hasErrorNotWindows: function () {
      return this.el('o-form-error-not-windows').length == 1;
    },

    backLink: function () {
      return this.el('back-link');
    }
  });

});

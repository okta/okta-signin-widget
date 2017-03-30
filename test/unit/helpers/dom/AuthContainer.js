define(['okta/jquery', './Dom'], function ($, Dom) {

  return Dom.extend({

    authContainer: function () {
      return this.el('auth-container');
    },

    canBeMinimized: function () {
      return this.authContainer().hasClass('can-remove-beacon');
    }

  });

});

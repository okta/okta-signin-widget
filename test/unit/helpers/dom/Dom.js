define([
  'okta',
  'helpers/util/jquery.okta'
],
function (Okta) {

  var { Class } = Okta.internal.util;

  return Class.extend({

    initialize: function ($root) {
      this.$root = $root;
    },

    el: function (dataSe) {
      var sel = '[data-se="' + dataSe + '"]';
      if (this.$root.is(sel)) {
        return this.$root;
      }
      return this.$root.find(sel);
    },

    $: function (selector) {
      return this.$root.find(selector);
    }

  });

});

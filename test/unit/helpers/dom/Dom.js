define([
  'jquery',
  'underscore',
  'shared/util/Class',
  'helpers/util/jquery.okta'
],
function ($, _, Class) {

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

import { internal } from 'okta';
import 'helpers/util/jquery.okta';
let { Class } = internal.util;
const Dom = Class.extend({
  initialize: function($root) {
    this.$root = $root;
  },

  el: function(dataSe) {
    const sel = '[data-se="' + dataSe + '"]';

    if (this.$root.is(sel)) {
      return this.$root;
    }
    return this.$root.find(sel);
  },

  $: function(selector) {
    return this.$root.find(selector);
  },
});

Dom.isVisible = function($el) {
  // non-jquery method
  // return $el.css('visibility') === 'visible' && $el.css('display') !== 'none' && $el.html() !== '';

  // jquery method
  return $el.is(':visible');
};

export default Dom;

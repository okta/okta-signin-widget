import { internal } from '@okta/courage';
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
  // jsdom has issue with :visible selector
  // check visibility recursively instead
  if (global.useJest) {
    // non-jquery method
    if ($el.is('body') || $el.is(document)) {
      return true;
    }
    return $el.css('visibility') === 'visible' && $el.css('display') !== 'none' && Dom.isVisible($el.parent());
  }
  
  // jquery method
  return $el.is(':visible');
};

export default Dom;

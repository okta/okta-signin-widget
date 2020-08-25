import { internal } from 'okta';
import 'helpers/util/jquery.okta';
let { Class } = internal.util;
export default Class.extend({
  initialize: function ($root) {
    this.$root = $root;
  },

  el: function (dataSe) {
    const sel = '[data-se="' + dataSe + '"]';

    if (this.$root.is(sel)) {
      return this.$root;
    }
    return this.$root.find(sel);
  },

  $: function (selector) {
    return this.$root.find(selector);
  },
});

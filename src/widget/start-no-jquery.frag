(function (root, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['jquery'], factory);
  }
  else {
    root.OktaSignIn = factory(root.jQuery);
  }
}(this, function (jQuery) {

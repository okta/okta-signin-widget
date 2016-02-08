define(['jquery'], function ($) {

  $.fn.trimmedText = function () {
    return $.trim(this.text());
  };

});

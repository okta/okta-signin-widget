define(['okta'], function (Okta) {
  var { $ } = Okta;
  $.fn.trimmedText = function () {
    return $.trim(this.text());
  };

});

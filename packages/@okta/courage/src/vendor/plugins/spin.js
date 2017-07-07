define(['jquery', './spin-2.3.2'], function ($, Spinner) {
  $.fn.spin = function (opts) {
    this.each(function () {
      try {
        var $this = $(this),
            data = $this.data();

        if (data.spinner) {
          data.spinner.stop();
          delete data.spinner;
        }
        if (opts !== false) {
          data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
        }
      }
      catch (e) {
        window.console && window.console.error(e);
      }
    });
    return this;
  };
});
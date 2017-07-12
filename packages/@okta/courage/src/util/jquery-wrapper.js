/* eslint okta/enforce-requirejs-names: 0, okta/no-specific-modules: 0 */
define(['jquery', 'vendor/lib/json2'], function ($) {
  $(function () {
    $.ajaxSetup({
      headers: {
        'X-Okta-XsrfToken': $('#_xsrfToken').text()
      },
      converters: {
        'text secureJSON': function (str) {
          if (str.substring(0, 11) === 'while(1){};') {
            str = str.substring(11);
          }
          return JSON.parse(str);
        }
      }
    });
  });
  // Selenium Hook
  // Widget such as autocomplete and autosuggest needs to be triggered from the running version of jQuery.
  // We have 2 versions of jQuery running in parallel and they don't share the same events bus
  window.jQueryCourage = $;
  return $;
});

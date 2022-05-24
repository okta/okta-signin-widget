import $ from 'jquery';

/* eslint-disable @okta/okta-ui/enforce-requirejs-names, @okta/okta-ui/no-specific-modules */
$.ajaxSetup({
  beforeSend: function (xhr) {
    xhr.setRequestHeader('X-Okta-XsrfToken', $('#_xsrfToken').text());
  },
  converters: {
    'text secureJSON': function (str) {
      if (str.substring(0, 11) === 'while(1){};') {
        str = str.substring(11);
      }

      return JSON.parse(str);
    }
  }
}); // Selenium Hook
// Widget such as autocomplete and autosuggest needs to be triggered from the running version of jQuery.
// We have 2 versions of jQuery running in parallel and they don't share the same events bus

const oktaJQueryStatic = $;
window.jQueryCourage = oktaJQueryStatic;

export { oktaJQueryStatic as default };

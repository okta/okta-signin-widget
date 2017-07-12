/* global okta */
/* eslint okta/enforce-requirejs-names: 0, okta/no-specific-modules: 0 */
define(['moment-tz'], function (moment) {
  if (typeof okta != 'undefined' && (okta.locale || 'en')) {
    moment.locale(okta.locale || 'en');
  }
  return moment;
});

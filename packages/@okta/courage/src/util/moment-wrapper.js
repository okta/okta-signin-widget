/* global okta */
/* eslint okta/no-specific-modules: 0 */
define(['moment'], function (moment) {
  if (typeof okta != 'undefined' && (okta.locale || 'en')) {
    moment.locale(okta.locale || 'en');
  }
  return moment;
});

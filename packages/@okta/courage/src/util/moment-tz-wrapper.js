/* global okta */
define(['moment-tz'], function (momentTz) {
  if (typeof okta != 'undefined' && (okta.locale || 'en')) {
    momentTz.locale(okta.locale || 'en');
  }
  return momentTz;
});

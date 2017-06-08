define(['okta/underscore', 'okta/moment-tz'], function (_, moment) {
  return {

    // Returns the three letter abbreviation of a timezone
    // Base date determines if daylight savings format should be used
    getAbbreviation: function (timezone, baseDate) {
      return moment(baseDate).tz(timezone).format('z');
    },

    // Returns whether a timezone is valid or not
    isTimezoneValid: function (timezone) {
      return !!moment.tz.zone(timezone);
    },

    // Returns timezones with underscores and slashes converted for searchability
    timezones: (function () {
      var locales = moment.tz.names();
      return _.object(locales, locales.map(function (locale) {
        return locale.replace(/_/g, ' ').replace(/\//g, ': ');
      }));
    }())

  };

});

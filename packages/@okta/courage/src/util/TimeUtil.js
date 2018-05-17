define(['okta/moment'], function (moment) {

  var MOMENT_UNIT = {
    'MILLISECOND': 'milliseconds',
    'SECOND': 'seconds',
    'MINUTE': 'minutes',
    'HOUR': 'hours',
    'DAY': 'days'
  };

  return {
    MINUTES_HOURS_DAYS: {
      'MINUTE': 'Minutes',
      'HOUR': 'Hours',
      'DAY': 'Days'
    },

    MILLISECONDS_SECONDS_MINUTES: {
      'MILLISECOND': 'Milliseconds',
      'SECOND': 'Seconds',
      'MINUTE': 'Minutes'
    },

    // TODO: OKTA-32410 proper fix for displaying PDT
    convertToPDT: function (milliseconds, formatter, defaultText) {
      // 'Apr 17, 2014 8:37:50 AM' or 'Never'
      formatter || (formatter = 'MMM DD, YYYY h:mm:ss A');
      defaultText || (defaultText = '');
      return milliseconds ? moment(milliseconds).utc().utcOffset('-07:00').format(formatter) : defaultText;
    },

    /**
     * @method getTimeInHighestRelevantUnit
     * Will return a number in the units of the highest relevant time unit.
     * Only checks milliseconds, seconds, minutes, hours, and days.
     * E.g.
     *   15 minutes -> 15 minutes
     *   60 minutes ->  1 hours
     *   90 minutes -> 90 minutes
     *   24 hours   ->  1 days
     *
     * @param {Number} val  The amount of time
     * @param {String} unit The units that val is in
     * @return {Object} An object containing the amount of time and the units it's in
     */
    getTimeInHighestRelevantUnit: function (val, unit) {
      var duration = moment.duration(val, MOMENT_UNIT[unit] || unit);
      var highestUnit;
      if (duration.milliseconds() !== 0) {
        highestUnit = 'milliseconds';
      } else if (duration.seconds() !== 0) {
        highestUnit = 'seconds';
      } else if (duration.minutes() !== 0) {
        highestUnit = 'minutes';
      } else if (duration.hours() !== 0) {
        highestUnit = 'hours';
      } else {
        highestUnit = 'days';
      }
      return {
        time: duration.as(highestUnit),
        unit: this.convertMomentUnits(highestUnit)
      };
    },

    /**
     * @method convertMomentUnits
     * Does the conversion between moment's units and our units internally
     *
     * @param {String} momentUnit The units that val is in
     * @return {String} The key in the MINUTES_HOURS_DAYS hash
     */
    convertMomentUnits: function (momentUnit) {
      switch (momentUnit) {
      case 'milliseconds':
        return 'MILLISECOND';
      case 'seconds':
        return 'SECOND';
      case 'minutes':
        return 'MINUTE';
      case 'hours':
        return 'HOUR';
      case 'days':
        return 'DAY';
      default:
        throw new Error('Time unit not recognized: ' + momentUnit);
      }
    },

    /**
     * @method convertTimeUnit
     * Converts a given value from one unit to another
     *
     * @param {Number} val The amount of time in fromUnits
     * @param {String} fromUnit The units that val is in on input
     * @param {String} toUnit The units to convert to
     * @return {Number} The amount of time in toUnits
     */
    convertTimeUnit: function (val, fromUnit, toUnit) {
      val = parseInt(val, 10);
      fromUnit = MOMENT_UNIT[fromUnit] || fromUnit;
      toUnit = MOMENT_UNIT[toUnit] || toUnit;
      return moment.duration(val, fromUnit).as(toUnit);
    },

    /**
     * @method convertTimeFormat
     * Converts a given time string from one format to another in local time
     *
     * @param {String} timeString The time string to be parsed
     * @param {String} fromFormatter The timeString's parser format
     * @param {String} toFormatter The format that the timeString to convert to
     * @return {String} The time string in the converted format in local time
     */
    convertTimeFormat: function (timeString, fromFormatter, toFormatter) {
      toFormatter || (toFormatter = 'MMMM Do, YYYY');
      return moment(timeString, fromFormatter).format(toFormatter);
    }
  };
});

import toMilliseconds from '@sindresorhus/to-milliseconds';
import parseMs from 'parse-ms';

const MOMENT_UNIT = {
  MILLISECOND: 'milliseconds',
  SECOND: 'seconds',
  MINUTE: 'minutes',
  HOUR: 'hours',
  DAY: 'days',
};

const MOMENT_UNIT_KEYS = Object.keys(MOMENT_UNIT);

/**
 * @method convertMomentUnits
 * Conversion between moment's units and our units internally
 *
 * @param {String} momentUnit The units that val is in
 * @return {String} The key in the MOMENT_UNIT hash
 */
const convertMomentUnits = function(momentUnit) {
  const entry = MOMENT_UNIT_KEYS.filter(k => MOMENT_UNIT[k] === momentUnit);

  return entry.length === 1 ? entry[0] : momentUnit;
};

export default {
  /**
   * @method getTimeInHighestRelevantUnit
   * Will return a number in the units of the highest relevant time unit.
   * Only checks milliseconds, seconds, minutes, hours, and days.
   * E.g.
   *   15 MINUTE  -> 15 MINUTE
   *   15 minutes -> 15 MINUTE
   *   60 minutes ->  1 HOUR
   *   90 minutes -> 90 MINUTE
   *   24 HOUR    ->  1 DAY
   *   24 hours   ->  1 DAY
   *   30 DAY     -> 30 DAY
   *
   * @typedef { "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY" } TimeUnit
   *
   * @typedef { "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY" |
   *            "milliseconds" | "seconds" | "minutes" | "hours" | "days"
   *          } FlexibleTimeUnit
   *
   * @typedef TimeAndUnit
   * @property {number} time the consolidated time
   * @property {TimeUnit} unit the unit of the time
   *
   * @param {FlexibleTimeUnit} unit The time unit
   * @return {TimeAndUnit} An object containing the amount of time and the unit
   */
  getTimeInHighestRelevantUnit: function(val, unit) {
    const defaultTimeObj = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    };
    const normalizedUnit = MOMENT_UNIT[unit] || unit;
    let timeObj;

    try {
      const ms = toMilliseconds(Object.assign(defaultTimeObj, { [normalizedUnit]: val }));
      timeObj = parseMs(ms);
    } catch (error) {
      timeObj = {};
    }

    const duration = Object.keys(timeObj).reduce((init, k) => {
      if (timeObj[k] !== 0) {
        init[k] = timeObj[k];
      }
      return init;
    }, {});

    let highestUnit;
    let time;
    if (Object.keys(duration).length === 1) {
      Object.keys(duration).forEach(k => {
        time = duration[k];
        highestUnit = k;
      });
    } else {
      time = val;
      highestUnit = normalizedUnit;
    }

    return {
      time: time,
      unit: convertMomentUnits(highestUnit),
    };
  },

  /**
   * @method formatDateToDeviceAssuranceGracePeriodExpiryLocaleString
   * Conversion from a Date object to a locale string that mimics Okta's `short-with-timezone` format
   * but rounded down to the nearest hour
   * e.g. new Date(2024-09-05T00:00:00.000Z) -> 09/05/2024, 8:00 PM EDT
   *
   * @param {Date} date The Date object for the grace period expiry
   * @param {LanguageCode} languageCode The user's language code / locale
   * @return {string} The formatted `short-with-timezone` local string
   */
  formatDateToDeviceAssuranceGracePeriodExpiryLocaleString: (date, languageCode) => {
    try {
    // Invalid Date objects will return NaN for valueOf()
      if (date && !isNaN(date.valueOf()) && languageCode !== null) {
        // Round down the date to the nearest hour
        date.setMinutes(0, 0, 0);
        return date.toLocaleString(languageCode, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        });
      } else {
        return null;
      }
    } catch (e) {
      // If `languageCode` isn't in a valid format `toLocaleString()` will throw a `RangeError`
      return null;
    }
  }
};

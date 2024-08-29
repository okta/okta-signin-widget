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
   * @method formatUnixEpochToDeviceAssuranceGracePeriodDueDate
   * Conversion from a Unix epoch in milliseconds to a MM/DD/YYYY format in the local timezone
   * e.g. 1725667200000 -> 09/06/2024 if the local timezone is EST
   *
   * @param {number} epoch The epoch in milliseconds
   * @return {String} The formatted MM/DD/YYY string
   */
  formatUnixEpochToDeviceAssuranceGracePeriodDueDate: (epoch) => {
    const date = new Date(epoch);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  },

  /**
   * @method formatUnixEpochToDeviceAssuranceGracePeriodDueDays
   * Conversion from a Unix epoch in milliseconds to the # of days between the time in the local timezone and the epoch
   *
   * @param {number} epoch The epoch in milliseconds
   * @return {number} The # of days between the time in the local timezone and the epoch
   */
  formatUnixEpochToDeviceAssuranceGracePeriodDueDays: (epoch) => {
    return Math.max(0, Math.floor((epoch - new Date().getTime()) / (1000 * 3600 * 24)));
  }
};


const MOMENT_UNIT = {
  MILLISECOND: 'milliseconds',
  SECOND: 'seconds',
  MINUTE: 'minutes',
  HOUR: 'hours',
  DAY: 'days'
};

// import parseMs from 'parse-ms';
const parseMs = ms => {
  if (typeof ms !== 'number') {
    throw new TypeError('Expected a number');
  }

  const roundTowardsZero = ms > 0 ? Math.floor : Math.ceil;

  return {
    days: roundTowardsZero(ms / 86400000),
    hours: roundTowardsZero(ms / 3600000) % 24,
    minutes: roundTowardsZero(ms / 60000) % 60,
    seconds: roundTowardsZero(ms / 1000) % 60,
    milliseconds: roundTowardsZero(ms) % 1000,
    microseconds: roundTowardsZero(ms * 1000) % 1000,
    nanoseconds: roundTowardsZero(ms * 1e6) % 1000
  };
};

// import toMilliseconds from '@sindresorhus/to-milliseconds';
const toMilliseconds = object => {
  let ms = 0;

  for (const [key, value] of Object.entries(object)) {
    if (typeof value !== 'number') {
      throw new TypeError(`Expected a \`number\` for key \`${key}\`, got \`${value}\` (${typeof value})`);
    }

    switch (key) {
    case 'days':
      ms += value * 864e5;
      break;
    case 'hours':
      ms += value * 36e5;
      break;
    case 'minutes':
      ms += value * 6e4;
      break;
    case 'seconds':
      ms += value * 1e3;
      break;
    case 'milliseconds':
      ms += value;
      break;
    case 'microseconds':
      ms += value / 1e3;
      break;
    case 'nanoseconds':
      ms += value / 1e6;
      break;
    default:
      throw new Error('Unsupported time key');
    }
  }

  return ms;
};


module.exports = {


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
    const defaultTimeObj = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0
    };
    const normalizedUnit = MOMENT_UNIT[unit] || unit;
    let timeObj;
    try {
      const ms = toMilliseconds(Object.assign(defaultTimeObj, { [normalizedUnit]: val }));
      timeObj = parseMs(ms);
    } catch (error) {
      timeObj = {};
    }

    const duration = Object.keys(timeObj)
      .reduce((init, k) => {
        if (timeObj[k] !== 0) {
          init[k] = timeObj[k];
        }
        return init;
      }, {});

    let highestUnit;
    let time;
    if (Object.keys(duration).length === 1) {
      Object.keys(duration)
        .forEach(k => {
          time = duration[k];
          highestUnit = k;
        });
    } else {
      time = val;
      highestUnit = normalizedUnit;
    }

    return {
      time: time,
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
      return momentUnit;
    }
  },


};

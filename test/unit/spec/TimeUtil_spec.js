import TimeUtil from 'util/TimeUtil';

describe('util/TimeUtil', function() {
  describe('getTimeInHighestRelevantUnit', function() {
    it('converts millisends', function() {
      expect(TimeUtil.getTimeInHighestRelevantUnit(0, 'milliseconds')).toEqual({
        time: 0,
        unit: 'MILLISECOND',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(1, 'milliseconds')).toEqual({
        time: 1,
        unit: 'MILLISECOND',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(1000, 'MILLISECOND')).toEqual({
        time: 1,
        unit: 'SECOND',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(1001, 'MILLISECOND')).toEqual({
        time: 1001,
        unit: 'MILLISECOND',
      });
    });

    it('converts seconds', function() {
      expect(TimeUtil.getTimeInHighestRelevantUnit(0, 'minutes')).toEqual({
        time: 0,
        unit: 'MINUTE',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(15, 'SECOND')).toEqual({
        time: 15,
        unit: 'SECOND',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(120, 'minutes')).toEqual({
        time: 2,
        unit: 'HOUR',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(61, 'SECOND')).toEqual({
        time: 61,
        unit: 'SECOND',
      });
    });

    it('converts minutes', function() {
      expect(TimeUtil.getTimeInHighestRelevantUnit(0, 'minutes')).toEqual({
        time: 0,
        unit: 'MINUTE',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(15, 'MINUTE')).toEqual({
        time: 15,
        unit: 'MINUTE',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(120, 'MINUTE')).toEqual({
        time: 2,
        unit: 'HOUR',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(61, 'minutes')).toEqual({
        time: 61,
        unit: 'MINUTE',
      });
    });

    it('converts hours', function() {
      expect(TimeUtil.getTimeInHighestRelevantUnit(0, 'hours')).toEqual({
        time: 0,
        unit: 'HOUR',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(15, 'HOUR')).toEqual({
        time: 15,
        unit: 'HOUR',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(24, 'HOUR')).toEqual({
        time: 1,
        unit: 'DAY',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(25, 'hours')).toEqual({
        time: 25,
        unit: 'HOUR',
      });
    });

    it('keep days', function() {
      expect(TimeUtil.getTimeInHighestRelevantUnit(0, 'days')).toEqual({
        time: 0,
        unit: 'DAY',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(1, 'DAY')).toEqual({
        time: 1,
        unit: 'DAY',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(30, 'days')).toEqual({
        time: 30,
        unit: 'DAY',
      });
      expect(TimeUtil.getTimeInHighestRelevantUnit(365, 'DAY')).toEqual({
        time: 365,
        unit: 'DAY',
      });
    });

    it('no runtime error when unknow time unit', function() {
      expect(TimeUtil.getTimeInHighestRelevantUnit(10, 'foo')).toEqual({
        time: 10,
        unit: 'foo',
      });
    });
  });

  describe('formatDateToDeviceAssuranceGracePeriodExpiryLocaleString', () => {
    const languageCode = 'en';

    it('formats modern date', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00Z'), languageCode)).toEqual('09/05/2024, 12:00 AM UTC');
    });

    it('rounds down to the nearest hour', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:01:01Z'), languageCode)).toEqual('09/05/2024, 12:00 AM UTC');
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:30:30Z'), languageCode)).toEqual('09/05/2024, 12:00 AM UTC');
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T23:59:59Z'), languageCode)).toEqual('09/05/2024, 11:00 PM UTC');
    });


    it('falls back to default locale if `languageCode` is undefined', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00Z'), undefined)).toEqual('09/05/2024, 12:00 AM UTC');
    });

    it('returns null if Date object is invalid', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('invalid'), languageCode)).toBeNull();
    });

    it('returns null if Date object is null', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(null, languageCode)).toBeNull();
    });

    it('returns null if Date object is undefined', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(undefined, languageCode)).toBeNull();
    });

    it('returns null if `languageCode` is null', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00Z'), null)).toBeNull();
    });

    it('returns null if `languageCode` is syntactically invalid and throws RangeError', () => {
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00Z'), '')).toBeNull();
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00Z'), 'a')).toBeNull();
      expect(TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00Z'), 'aaaaaaaaa')).toBeNull();
    });
  });

  describe('calculateDaysBetweenEpochTimestamps', () => {
    it('calculates days between epoch timestamps', () => {
      const epoch1 = 1741564800000; // March 10, 2025 00:00:00 GMT
      const epoch2 = 1742169600000; // March 17, 2025 00:00:00 GMT
      expect(TimeUtil.calculateDaysBetweenEpochTimestamps(epoch1, epoch2)).toEqual(7);
    });

    it('rounds down to the nearest day', () => {
      const epoch1 = 1741564800000; // March 10, 2025 00:00:00 GMT
      const epoch2 = 1742169599000; // March 16, 2025 23:59:59 GMT
      expect(TimeUtil.calculateDaysBetweenEpochTimestamps(epoch1, epoch2)).toEqual(6);
    });

    it('returns null when less than a day', () => {
      const epoch1 = 1741564800000; // March 10, 2025 00:00:00 GMT
      const epoch2 = 1741651199000; // March 10, 2025 23:59:59 GMT
      expect(TimeUtil.calculateDaysBetweenEpochTimestamps(epoch1, epoch2)).toBe(0);
    });

    it('returns null when a param is undefined', () => {
      const epoch1 = 1741564800000; // March 10, 2025 12:00 GMT
      const epoch2 = undefined;
      expect(TimeUtil.calculateDaysBetweenEpochTimestamps(epoch1, epoch2)).toBeNull();
    });

    it('returns null when a param is null', () => {
      const epoch1 = 1741564800000; // March 10, 2025 12:00 GMT
      const epoch2 = null;
      expect(TimeUtil.calculateDaysBetweenEpochTimestamps(epoch1, epoch2)).toBeNull();
    });

    it('returns null when a param invalid', () => {
      const epoch1 = 1741564800000; // March 10, 2025 12:00 GMT
      const epoch2 = 'abc';
      expect(TimeUtil.calculateDaysBetweenEpochTimestamps(epoch1, epoch2)).toBeNull();
    });
  });
});

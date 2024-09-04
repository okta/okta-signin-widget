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
});

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

  // These tests assume timezone is UTC, so if they are failing try running the test with
  // TZ=UTC as an environment variable (e.g. `TZ=UTC yarn jest test/unit/spec/TimeUtil_spec.js`)
  describe('formatUnixEpochToDeviceAssuranceGracePeriodDueDate', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date('2024-08-29T00:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('formats modern date', () => {
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDate(1724976000000)).toEqual('08/30/2024');
    });

    it('formats the start of a year', () => {
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDate(1735689600000)).toEqual('01/01/2025');
    });

    it('formats the beginning of Unix time', () => {
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDate(0)).toEqual('01/01/1970');
    });

    it('formats dates before the beginning of Unix time', () => {
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDate(-2208988800000)).toEqual('01/01/1900');
    });
  });

  // These tests assume timezone is UTC, so if they are failing try running the test with
  // TZ=UTC as an environment variable (e.g. `TZ=UTC yarn jest test/unit/spec/TimeUtil_spec.js`)
  describe('formatUnixEpochToDeviceAssuranceGracePeriodDueDays', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern');
      jest.setSystemTime(new Date('2024-08-29T00:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('formats future date', () => {
      // 2025-01-01T00:00:00Z
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(1735689600000)).toEqual(125);
    });

    it('formats one minute before the next day as 0', () => {
      // 2024-08-29T23:59:59Z
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(1724975999000)).toEqual(0);
    });

    it('formats exactly the next day as 1', () => {
      // 2024-08-30T00:00:00Z
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(1724976000000)).toEqual(1);
    });


    it('formats past dates to always be 0', () => {
      // 2024-08-28T23:59:59Z
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(1724889599000)).toEqual(0);
      // 2024-08-28T00:00:00Z
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(1724803200000)).toEqual(0);
      // 1970-01-01T00:00:00Z
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(0)).toEqual(0);
      // 1900-01-01T00:00:00Z
      expect(TimeUtil.formatUnixEpochToDeviceAssuranceGracePeriodDueDays(-2208988800000)).toEqual(0);
    });
  });
});

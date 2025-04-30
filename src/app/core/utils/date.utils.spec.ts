import { DateUtils } from './date.utils';

describe('DateUtils', () => {
  describe('DateUtils.formateDateToYMD', () => {
    it('should return empty string for null input', () => {
      expect(DateUtils.formatDateToYMD(null)).toBe('');
    });

    it('should return empty string for invalid Date', () => {
      expect(DateUtils.formatDateToYMD(new Date('invalid-date'))).toBe('');
    });

    it('should format a regular date properly', () => {
      // Using a fixed date: April 15, 2023
      const testDate = new Date(2023, 3, 15); // Note: months are 0-indexed in JS
      expect(DateUtils.formatDateToYMD(testDate)).toBe('2023-04-15');
    });

    it('should handle single-digit months and days', () => {
      // January 5, 2023
      const testDate = new Date(2023, 0, 5);
      expect(DateUtils.formatDateToYMD(testDate)).toBe('2023-01-05');
    });

    it('should format dates at the end of month correctly', () => {
      // December 31, 2023
      const testDate = new Date(2023, 11, 31);
      expect(DateUtils.formatDateToYMD(testDate)).toBe('2023-12-31');
    });

    it('should handle leap years correctly', () => {
      // February 29, 2024 (leap year)
      const testDate = new Date(2024, 1, 29);
      expect(DateUtils.formatDateToYMD(testDate)).toBe('2024-02-29');
    });

    it('should handle different years correctly', () => {
      // Testing with past year
      expect(DateUtils.formatDateToYMD(new Date(1999, 11, 31))).toBe(
        '1999-12-31'
      );

      // Testing with future year
      expect(DateUtils.formatDateToYMD(new Date(2030, 0, 1))).toBe(
        '2030-01-01'
      );
    });

    it('should handle date objects with time components', () => {
      // Date with specific time: June 15, 2023, 14:30:45
      const testDate = new Date(2023, 5, 15, 14, 30, 45);
      expect(DateUtils.formatDateToYMD(testDate)).toBe('2023-06-15');
    });

    it('should handle midnight correctly', () => {
      // Midnight on July 10, 2023
      const testDate = new Date(2023, 6, 10, 0, 0, 0);
      expect(DateUtils.formatDateToYMD(testDate)).toBe('2023-07-10');
    });

    it('should adjust for timezone correctly', () => {
      // Create a date using UTC time to test timezone adjustment
      const utcDate = new Date(Date.UTC(2023, 5, 15)); // June 15, 2023 in UTC

      // Expected result should be the local date representation
      const offset = utcDate.getTimezoneOffset();
      const localDate = new Date(utcDate.getTime() - offset * 60 * 1000);
      const expected = localDate.toISOString().split('T')[0];

      expect(DateUtils.formatDateToYMD(utcDate)).toBe(expected);
    });

    it('should create the same output regardless of time of day', () => {
      // Same date but different times
      const morningDate = new Date(2023, 7, 20, 9, 0, 0); // August 20, 2023 9:00 AM
      const eveningDate = new Date(2023, 7, 20, 21, 0, 0); // August 20, 2023 9:00 PM

      expect(DateUtils.formatDateToYMD(morningDate)).toBe('2023-08-20');
      expect(DateUtils.formatDateToYMD(eveningDate)).toBe('2023-08-20');
      expect(DateUtils.formatDateToYMD(morningDate)).toEqual(
        DateUtils.formatDateToYMD(eveningDate)
      );
    });
  });

  describe('DateUtils.formatDateToYMDWithTime', () => {
    // Basic functionality test
    it('should format a date to YYYY-MM-DDThh:mm format', () => {
      const date = new Date(2023, 3, 15, 14, 30); // April 15, 2023, 14:30
      expect(DateUtils.formatDateToYMDWithTime(date)).toBe('2023-04-15T14:30');
    });

    // Null handling
    it('should return empty string for null date', () => {
      expect(DateUtils.formatDateToYMDWithTime(null)).toBe('');
    });

    // Invalid date handling
    it('should return empty string for invalid date', () => {
      const invalidDate = new Date('not a date');
      expect(DateUtils.formatDateToYMDWithTime(invalidDate)).toBe('');
    });

    // Zero padding test
    it('should pad single-digit hours and minutes with leading zeros', () => {
      const date = new Date(2023, 0, 1, 9, 5); // January 1, 2023, 9:05
      expect(DateUtils.formatDateToYMDWithTime(date)).toBe('2023-01-01T09:05');
    });

    // Edge case: midnight
    it('should correctly format midnight time', () => {
      const date = new Date(2023, 5, 30, 0, 0); // June 30, 2023, 00:00
      expect(DateUtils.formatDateToYMDWithTime(date)).toBe('2023-06-30T00:00');
    });

    // Edge case: end of day
    it('should correctly format end of day time', () => {
      const date = new Date(2023, 5, 30, 23, 59); // June 30, 2023, 23:59
      expect(DateUtils.formatDateToYMDWithTime(date)).toBe('2023-06-30T23:59');
    });

    // Seconds handling test
    it('should not include seconds in the formatted output', () => {
      const date = new Date(2023, 0, 1, 12, 34, 56);
      expect(DateUtils.formatDateToYMDWithTime(date)).toBe('2023-01-01T12:34');
    });

    // Month boundary test
    it('should handle month number correctly (zero-based to one-based)', () => {
      const date = new Date(2023, 0, 1, 10, 20); // January 1, 2023
      expect(DateUtils.formatDateToYMDWithTime(date)).toBe('2023-01-01T10:20');

      const date2 = new Date(2023, 11, 31, 10, 20); // December 31, 2023
      expect(DateUtils.formatDateToYMDWithTime(date2)).toBe('2023-12-31T10:20');
    });
  });
});

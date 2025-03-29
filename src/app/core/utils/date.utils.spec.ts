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
});

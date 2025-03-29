/**
 * Converts a Date object to YYYY-MM-DD string format (ISO date format)
 * Adjusts for timezone to ensure the local date is properly represented
 *
 * @param date The Date object to format
 * @returns YYYY-MM-DD formatted string, or empty string if date is invalid
 */
export function formateDateToYMD(date: Date | null): string {
  if (!date) return '';
  if (isNaN(date.getTime())) return '';

  const localDate = new Date(date);
  // Adjust for UTC offset from toISOString
  const offset = localDate.getTimezoneOffset();
  const adjustedDate = new Date(localDate.getTime() - offset * 60 * 1000);

  return adjustedDate.toISOString().split('T')[0];
}

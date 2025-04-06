/**
 * Date utility functions for handling dates and times consistently across the application
 */

/**
 * Returns the current date
 */
export function now(): Date {
  return new Date();
}

/**
 * Returns the start of the day (midnight) for the given date
 */
export function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Returns the end of the day (23:59:59.999) for the given date
 */
export function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Returns true if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCDate() === date2.getUTCDate() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCFullYear() === date2.getUTCFullYear()
  );
}

/**
 * Returns true if two dates are in the same week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Set both dates to start of week (Sunday)
  d1.setDate(d1.getDate() - d1.getDay());
  d2.setDate(d2.getDate() - d2.getDay());

  return isSameDay(d1, d2);
}

/**
 * Returns true if two dates are in the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCFullYear() === date2.getUTCFullYear()
  );
}

/**
 * Returns the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns the number of weeks between two dates
 */
export function weeksBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
}

/**
 * Returns the number of months between two dates
 */
export function monthsBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
}

/**
 * Returns the number of years between two dates
 */
export function yearsBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
}

/**
 * Returns a new date with the specified number of days added
 */
export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * Returns a new date with the specified number of weeks added
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Returns a new date with the specified number of months added
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

/**
 * Returns a new date with the specified number of years added
 */
export function addYears(date: Date, years: number): Date {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
}

/**
 * Converts a date to an ISO string, handling null values
 */
export function toISOString(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

/**
 * Converts an ISO string to a date, throwing an error for invalid dates
 */
export function fromISOString(iso: string): Date {
  if (!iso) {
    throw new Error("Invalid date string: empty or null");
  }
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${iso}`);
  }
  return date;
}

/**
 * Returns true if the first date is after or equal to the second date
 */
export function isAfterOrEqual(date1: Date, date2: Date): boolean {
  return date1.getTime() >= date2.getTime();
}

/**
 * Returns true if the first date is before or equal to the second date
 */
export function isBeforeOrEqual(date1: Date, date2: Date): boolean {
  return date1.getTime() <= date2.getTime();
}

/**
 * Formats a date using the specified options
 */
export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return date.toLocaleDateString(undefined, options);
}

/**
 * Formats a time using the specified options
 */
export function formatTime(
  date: Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return date.toLocaleTimeString(undefined, options);
}

/**
 * Formats a date string using the specified format
 */
export function formatDateString(date: Date, format: string): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();

  return format
    .replace("YYYY", year.toString())
    .replace("MM", month.toString().padStart(2, "0"))
    .replace("DD", day.toString().padStart(2, "0"))
    .replace("HH", hours.toString().padStart(2, "0"))
    .replace("mm", minutes.toString().padStart(2, "0"))
    .replace("ss", seconds.toString().padStart(2, "0"))
    .replace("SSS", milliseconds.toString().padStart(3, "0"));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setDate(date.getDate() - date.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setDate(date.getDate() - date.getDay() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";

/**
 * Returns today's date with time set to 00:00:00
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Returns tomorrow's date with time set to 00:00:00
 */
export function getTomorrow(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

/**
 * Returns the start of the current month (first day, 00:00:00)
 */
export function getStartOfMonth(): Date {
  const date = startOfMonth(new Date());
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns the end of the current month (last day, 23:59:59)
 */
export function getEndOfMonth(): Date {
  const date = endOfMonth(new Date());
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Returns the start of the week (7 days ago from today, 00:00:00)
 */
export function getStartOfWeek(): Date {
  const date = subDays(new Date(), 6);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Checks if two dates are the same day (ignoring time)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return format(date1, "yyyy-MM-dd") === format(date2, "yyyy-MM-dd");
}

/**
 * Formats a date to ISO string without time
 */
export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date, formatStr = "MMM d, yyyy"): string {
  return format(date, formatStr);
}

/**
 * Formats a time to a readable string
 */
export function formatTime(date: Date, formatStr = "h:mm a"): string {
  return format(date, formatStr);
}

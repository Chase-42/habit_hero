/**
 * Convert ISO string to Date
 */
export function fromISOString(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

import { differenceInDays, differenceInHours, isPast, format } from 'date-fns';

/**
 * Determines urgency level of a given deadline.
 * @param deadline - ISO date string of the deadline.
 * @returns Urgency level string.
 */
export function getDeadlineUrgency(deadline: string): 'urgent' | 'amber' | 'neutral' | 'expired' {
  const date = new Date(deadline);
  
  if (isPast(date)) return 'expired';
  
  const hoursLeft = differenceInHours(date, new Date());
  if (hoursLeft < 48) return 'urgent';
  
  const daysLeft = differenceInDays(date, new Date());
  if (daysLeft < 7) return 'amber';
  
  return 'neutral';
}

/**
 * Generates human-readable label for the time remaining until a deadline.
 * @param deadline - ISO date string of the deadline.
 * @returns Human-readable time left string.
 */
export function getDeadlineLabel(deadline: string): string {
  const date = new Date(deadline);
  
  if (isPast(date)) return 'Closed';
  
  const hoursLeft = differenceInHours(date, new Date());
  
  if (hoursLeft < 24) return 'Closes today';
  if (hoursLeft < 48) return 'Closes tomorrow';
  
  const daysLeft = differenceInDays(date, new Date());
  return `${daysLeft} days left`;
}

/**
 * Formats a given deadline date.
 * @param deadline - ISO date string of the deadline.
 * @returns Formatted date string (MMM d, yyyy).
 */
export function formatDeadline(deadline: string): string {
  return format(new Date(deadline), 'MMM d, yyyy');
}

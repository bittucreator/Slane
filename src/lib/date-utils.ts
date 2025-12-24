/**
 * @author Shiva Nagendra Babu Kore
 */

import { BUSINESS } from './constants';

export type DueDateStatus = 'normal' | 'due-today' | 'overdue';

export interface DueDateDisplay {
  text: string;
  status: DueDateStatus;
  className: string;
}

/**
 * Gets the user's timezone name
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Gets the user's timezone offset in minutes
 */
export function getUserTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}


/**
 * Creates a date for the start of day in user's local timezone
 */
function getLocalStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Converts a local date to UTC for storage, preserving the local date meaning
 */
export function convertLocalDateToUTC(localDate: Date): Date {
  // Extract the local date components
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();
  
  // Create a UTC date with the same date components at noon UTC
  // This ensures the date doesn't shift when converted back to local time
  const utcDate = new Date();
  utcDate.setUTCFullYear(year, month, day);
  utcDate.setUTCHours(12, 0, 0, 0);
  
  return utcDate;
}

/**
 * Converts a UTC date back to local date for comparison
 */
function convertUTCToLocalDate(utcDate: Date): Date {
  // Extract the UTC date components
  const year = utcDate.getUTCFullYear();
  const month = utcDate.getUTCMonth();
  const day = utcDate.getUTCDate();
  
  // Create a new local date with the same date components
  return new Date(year, month, day);
}

/**
 * Formats a due date for display with proper timezone handling
 */
export function formatDueDate(dueDate: Date): DueDateDisplay {
  // Convert UTC stored date back to local date for comparison
  const localDueDate = convertUTCToLocalDate(dueDate);
  
  const now = new Date();
  const today = getLocalStartOfDay(now);
  const dueDateOnly = getLocalStartOfDay(localDueDate);
  
  const diffTime = dueDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / BUSINESS.MILLISECONDS_PER_DAY);

  if (diffDays < 0) {
    // Overdue
    const daysPast = Math.abs(diffDays);
    return {
      text: daysPast === 1 ? 'Yesterday' : `${daysPast} days ago`,
      status: 'overdue',
      className: 'text-red-600 dark:text-red-400'
    };
  } else if (diffDays === 0) {
    // Due today
    return {
      text: 'Today',
      status: 'due-today',
      className: 'text-orange-600 dark:text-orange-400'
    };
  } else if (diffDays === 1) {
    // Due tomorrow
    return {
      text: 'Tomorrow',
      status: 'normal',
      className: 'text-gray-600 dark-text-secondary'
    };
  } else if (diffDays <= 7) {
    // Due this week
    const dayName = localDueDate.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      text: dayName,
      status: 'normal',
      className: 'text-gray-600 dark-text-secondary'
    };
  } else {
    // Due later
    const monthDay = localDueDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return {
      text: monthDay,
      status: 'normal',
      className: 'text-gray-600 dark-text-secondary'
    };
  }
}

/**
 * Gets the due date status for a task with proper timezone handling
 */
export function getDueDateStatus(dueDate: Date): DueDateStatus {
  const localDueDate = convertUTCToLocalDate(dueDate);
  const now = new Date();
  const today = getLocalStartOfDay(now);
  const dueDateOnly = getLocalStartOfDay(localDueDate);
  
  const diffTime = dueDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / BUSINESS.MILLISECONDS_PER_DAY);

  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays === 0) {
    return 'due-today';
  } else {
    return 'normal';
  }
}

/**
 * Checks if a date is today with proper timezone handling
 */
export function isToday(date: Date): boolean {
  const localDate = convertUTCToLocalDate(date);
  const now = new Date();
  const today = getLocalStartOfDay(now);
  const checkDate = getLocalStartOfDay(localDate);
  
  return checkDate.getTime() === today.getTime();
}

/**
 * Checks if a date is overdue with proper timezone handling
 */
export function isOverdue(date: Date): boolean {
  const localDate = convertUTCToLocalDate(date);
  const now = new Date();
  const today = getLocalStartOfDay(now);
  const checkDate = getLocalStartOfDay(localDate);
  
  return checkDate.getTime() < today.getTime();
}

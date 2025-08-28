/**
 * Date utility functions for handling various date formats and operations
 */

import { formatDistanceToNow, isValid, parseISO, format } from 'date-fns';

/**
 * Converts various date inputs to a JavaScript Date object
 */
export function toDate(input: string | Date | number): Date {
  if (input instanceof Date) {
    return input;
  }
  
  if (typeof input === 'number') {
    return new Date(input);
  }
  
  if (typeof input === 'string') {
    // Handle ISO string dates from database
    return new Date(input);
  }
  
  throw new Error(`Invalid date input: ${input}`);
}

/**
 * Formats a date for display in the UI
 */
export function formatDisplayDate(input: string | Date | number): string {
  const date = toDate(input);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formats a date as a relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(input: string | Date | number): string {
  const date = toDate(input);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (weeks < 4) {
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Formats a date for database storage (ISO string)
 */
export function formatDatabaseDate(input: string | Date | number): string {
  const date = toDate(input);
  return date.toISOString();
}

/**
 * Formats a date for file naming (safe for filesystem)
 */
export function formatFileDate(input: string | Date | number): string {
  const date = toDate(input);
  
  return date.toISOString()
    .replace(/:/g, '-')
    .replace(/\./g, '-')
    .slice(0, 19); // Remove milliseconds and timezone
}

/**
 * Checks if a date is today
 */
export function isToday(input: string | Date | number): boolean {
  const date = toDate(input);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
}

/**
 * Checks if a date is within the last 24 hours
 */
export function isWithinLast24Hours(input: string | Date | number): boolean {
  const date = toDate(input);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  return diffInMs <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
}

/**
 * Checks if a date is within the last week
 */
export function isWithinLastWeek(input: string | Date | number): boolean {
  const date = toDate(input);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  return diffInMs <= 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
}

/**
 * Groups dates by relative time periods
 */
export function getDateGroup(input: string | Date | number): 'today' | 'yesterday' | 'this-week' | 'this-month' | 'older' {
  const date = toDate(input);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const days = Math.floor(diffInMs / (24 * 60 * 60 * 1000));
  
  if (days === 0) {
    return 'today';
  } else if (days === 1) {
    return 'yesterday';
  } else if (days <= 7) {
    return 'this-week';
  } else if (days <= 30) {
    return 'this-month';
  } else {
    return 'older';
  }
}

/**
 * Formats a date for sorting (returns timestamp)
 */
export function getSortableDate(input: string | Date | number): number {
  const date = toDate(input);
  return date.getTime();
}

/**
 * Validates if a string is a valid date
 */
export function isValidDate(input: string): boolean {
  const date = new Date(input);
  return !isNaN(date.getTime());
}

/**
 * Gets the start of day for a given date
 */
export function getStartOfDay(input: string | Date | number): Date {
  const date = toDate(input);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Gets the end of day for a given date
 */
export function getEndOfDay(input: string | Date | number): Date {
  const date = toDate(input);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

/**
 * Safely formats a date to "time ago" format using date-fns
 * Handles invalid dates, null values, and string dates
 */
export function safeFormatDistanceToNow(date: string | Date | null | undefined): string {
  if (!date) return 'Unknown';
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Unknown';
  }
}

/**
 * Safely formats a date to a specific format using date-fns
 * Handles invalid dates, null values, and string dates
 */
export function safeFormatDate(date: string | Date | null | undefined, formatString: string = 'PPP'): string {
  if (!date) return 'Unknown';
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Unknown';
  }
}

/**
 * Checks if a date is valid using date-fns validation
 */
export function isValidDateSafe(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
    } else {
      dateObj = date;
    }
    
    return isValid(dateObj);
  } catch (error) {
    return false;
  }
}
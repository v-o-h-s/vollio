/**
 * Theme utility functions for storage and application
 */

import type { ThemeMode } from '@/lib/types/theme';

const STORAGE_KEY = 'noto-theme';

/**
 * Gets the stored theme preference from localStorage
 */
export function getStoredTheme(storageKey: string = STORAGE_KEY): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && ['light', 'dark'].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  return null;
}

/**
 * Stores the theme preference in localStorage
 */
export function setStoredTheme(theme: ThemeMode, storageKey: string = STORAGE_KEY): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(storageKey, theme);
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error);
  }
}

/**
 * Applies the theme to the document element
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add the new theme class
  root.classList.add(theme);
  
  // Update the data attribute for CSS custom properties
  root.setAttribute('data-theme', theme);
}

/**
 * Gets the initial theme configuration
 */
export function getInitialTheme(
  defaultTheme: ThemeMode = 'light',
  storageKey: string = STORAGE_KEY
): ThemeMode {
  const storedTheme = getStoredTheme(storageKey);
  return storedTheme || defaultTheme;
}
/**
 * Theme utility functions for system preference detection and storage
 */

import type { ThemeMode } from '@/lib/types/theme';

const STORAGE_KEY = 'noto-theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Detects the user's system theme preference
 */
export function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

/**
 * Gets the stored theme preference from localStorage
 */
export function getStoredTheme(storageKey: string = STORAGE_KEY): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
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
 * Resolves the actual theme to apply based on the theme mode and system preference
 */
export function resolveTheme(theme: ThemeMode, systemPreference: 'light' | 'dark'): 'light' | 'dark' {
  if (theme === 'system') {
    return systemPreference;
  }
  return theme;
}

/**
 * Applies the theme to the document element
 */
export function applyTheme(resolvedTheme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add the new theme class
  root.classList.add(resolvedTheme);
  
  // Update the data attribute for CSS custom properties
  root.setAttribute('data-theme', resolvedTheme);
}

/**
 * Creates a media query listener for system preference changes
 */
export function createSystemPreferenceListener(
  callback: (preference: 'light' | 'dark') => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const mediaQuery = window.matchMedia(MEDIA_QUERY);
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  // Add listener
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * Gets the initial theme configuration
 */
export function getInitialTheme(
  defaultTheme: ThemeMode = 'system',
  storageKey: string = STORAGE_KEY
): {
  theme: ThemeMode;
  systemPreference: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
} {
  const systemPreference = getSystemPreference();
  const storedTheme = getStoredTheme(storageKey);
  const theme = storedTheme || defaultTheme;
  const resolvedTheme = resolveTheme(theme, systemPreference);
  
  return {
    theme,
    systemPreference,
    resolvedTheme,
  };
}
'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/components/theme/ThemeProvider';
import type { ThemeContextValue } from '@/lib/types/theme';

/**
 * Hook for consuming theme context throughout the application
 * 
 * @returns ThemeContextValue with current theme state and control functions
 * @throws Error if used outside of ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 *   
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <p>Resolved theme: {resolvedTheme}</p>
 *       <button onClick={() => setTheme('dark')}>Dark Mode</button>
 *       <button onClick={() => setTheme('light')}>Light Mode</button>
 *       <button onClick={() => setTheme('system')}>System</button>
 *       <button onClick={toggleTheme}>Toggle Theme</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Make sure to wrap your app with <ThemeProvider>.'
    );
  }
  
  return context;
}

/**
 * Hook that returns only the resolved theme value
 * Useful for components that only need to know the current theme
 * 
 * @returns 'light' | 'dark' - The currently resolved theme
 */
export function useResolvedTheme(): 'light' | 'dark' {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
}

/**
 * Hook that returns a boolean indicating if dark mode is active
 * 
 * @returns boolean - True if dark mode is active
 */
export function useIsDarkMode(): boolean {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark';
}

/**
 * Hook that returns theme-aware CSS classes
 * 
 * @param lightClass - CSS class for light theme
 * @param darkClass - CSS class for dark theme
 * @returns string - The appropriate CSS class for current theme
 */
export function useThemeClass(lightClass: string, darkClass: string): string {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'dark' ? darkClass : lightClass;
}
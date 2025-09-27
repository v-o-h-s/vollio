/**
 * Theme-related types for light/dark mode system
 */

// ============================================================================
// THEME TYPES
// ============================================================================

/**
 * Theme mode options
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Theme state interface
 */
export interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: "light" | "dark";
  systemTheme: "light" | "dark";
}

/**
 * Theme context value with state and actions
 */
export interface ThemeContextValue extends ThemeState {
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}
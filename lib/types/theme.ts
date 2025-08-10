/**
 * Theme-related TypeScript interfaces and types
 */

export type Theme = "light" | "dark" | "system";

export interface ThemeConfig {
  /** The current theme setting */
  theme: Theme;
  /** Whether the resolved theme is dark */
  resolvedTheme: "light" | "dark";
  /** Whether the theme is being forced (not following system) */
  forcedTheme?: Theme;
  /** Available theme options */
  themes: Theme[];
  /** Whether system theme detection is enabled */
  systemTheme?: "light" | "dark";
}

export interface ThemeProviderProps {
  /** List of all available theme names */
  themes?: string[];
  /** Forced theme name for the current page */
  forcedTheme?: string;
  /** Whether to switch between dark and light themes based on prefers-color-scheme */
  enableSystem?: boolean;
  /** Disable all CSS transitions when switching themes */
  disableTransitionOnChange?: boolean;
  /** Key used to store theme setting in localStorage */
  storageKey?: string;
  /** Default theme name (for v0.0.12 and lower the default was light) */
  defaultTheme?: string;
  /** HTML attribute modified based on the active theme */
  attribute?: "class" | "data-theme" | "data-color-mode";
  /** Mapping of theme name to HTML attribute value */
  value?: Record<string, string>;
  /** Nonce string to pass to the inline script for CSP headers */
  nonce?: string;
  /** Custom element to receive theme class/attribute */
  enableColorScheme?: boolean;
  children?: React.ReactNode;
}

export interface UseThemeReturn {
  /** Active theme name */
  theme?: string;
  /** If `enableSystem` is true and the active theme is "system", this returns whether the system preference resolved to "dark" or "light". Otherwise, identical to `theme` */
  resolvedTheme?: string;
  /** If enableSystem is true, returns the System theme preference ("dark" or "light"), regardless what the active theme is */
  systemTheme?: "dark" | "light";
  /** Update the theme */
  setTheme: (theme: string) => void;
  /** Active theme name, this is always defined */
  forcedTheme?: string;
  /** All available theme names */
  themes: string[];
}

export interface ThemeContextValue extends UseThemeReturn {}

/**
 * Theme preference stored in localStorage
 */
export interface ThemePreference {
  theme: Theme;
  timestamp: number;
}

/**
 * Theme transition configuration
 */
export interface ThemeTransition {
  /** Duration of theme transition in milliseconds */
  duration?: number;
  /** CSS transition timing function */
  timingFunction?: string;
  /** Whether to disable transitions on theme change */
  disabled?: boolean;
}

/**
 * Component theme variant props
 */
export interface ThemeVariantProps {
  /** Theme variant for the component */
  variant?: "light" | "dark" | "auto";
  /** Whether to force a specific theme regardless of global theme */
  forceTheme?: boolean;
}

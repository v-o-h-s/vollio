/**
 * Theme system types and interfaces
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  systemPreference: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  enableSystem?: boolean;
}

export interface ThemeState {
  theme: ThemeMode;
  systemPreference: 'light' | 'dark';
  isInitialized: boolean;
}
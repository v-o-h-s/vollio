/**
 * Theme system exports
 */

export { ThemeProvider, ThemeContext } from './ThemeProvider';
export { ThemeDemo } from './ThemeDemo';
export { ThemeToggleDemo } from './ThemeToggleDemo';
export type { 
  ThemeMode, 
  ThemeConfig, 
  ThemeContextValue, 
  ThemeProviderProps, 
  ThemeState 
} from '@/lib/types/theme';
export {
  useTheme,
  useResolvedTheme,
  useIsDarkMode,
  useThemeClass,
} from '@/hooks/use-theme';
export {
  getSystemPreference,
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
  createSystemPreferenceListener,
  getInitialTheme,
} from '@/lib/utils/theme';
export { ThemeToggle } from '@/components/ui/theme-toggle';
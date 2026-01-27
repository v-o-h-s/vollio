/**
 * Theme system exports
 */

export { ThemeProvider, ThemeContext } from './ThemeProvider';
export { ThemeDemo } from './ThemeDemo';
export { ThemeToggleDemo } from './ThemeToggleDemo';
export type { 
  ThemeMode, 
  ThemeContextValue, 
  ThemeProviderProps, 
  ThemeState 
} from '@/lib/types/theme';
export {
  useTheme,
} from '@/hooks/use-theme';
export {
  setStoredTheme,
  applyTheme,
  getInitialTheme,
  watchSystemTheme,
} from '@/lib/utils/theme';
export { ThemeToggle } from '@/components/ui/theme-toggle';

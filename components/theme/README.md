# Theme System

A comprehensive theme management system for the Noto PDF annotation app, providing dark mode, light mode, and system preference support with localStorage persistence and cross-tab synchronization.

## Features

- **Multiple Theme Modes**: Light, Dark, and System preference
- **Persistent Storage**: Automatically saves theme preference to localStorage
- **System Integration**: Detects and responds to system theme changes
- **SSR Safe**: Prevents flash of incorrect theme (FOIT) during server-side rendering
- **Cross-tab Sync**: Theme changes are synchronized across browser tabs
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Accessibility**: WCAG compliant with proper contrast ratios and screen reader support

## Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from '@/components/theme';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="noto-theme">
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Use the theme in components

```tsx
import { useTheme } from '@/hooks/use-theme';

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div className={resolvedTheme === 'dark' ? 'dark-styles' : 'light-styles'}>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('system')}>System</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

### 3. Add theme script to prevent FOIT (Optional but recommended)

```tsx
import { getThemeScript } from '@/lib/theme-script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## API Reference

### ThemeProvider Props

```tsx
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode; // 'light' | 'dark' | 'system' (default: 'system')
  storageKey?: string; // localStorage key (default: 'noto-theme')
  enableSystem?: boolean; // Enable system preference detection (default: true)
}
```

### useTheme Hook

```tsx
interface ThemeContextValue {
  theme: ThemeMode; // Current theme setting
  resolvedTheme: 'light' | 'dark'; // Actual theme being applied
  systemPreference: 'light' | 'dark'; // System preference
  setTheme: (theme: ThemeMode) => void; // Set specific theme
  toggleTheme: () => void; // Cycle through themes
}
```

### Utility Hooks

```tsx
// Get only the resolved theme
const resolvedTheme = useResolvedTheme(); // 'light' | 'dark'

// Get boolean for dark mode
const isDarkMode = useIsDarkMode(); // boolean

// Get theme-aware CSS classes
const className = useThemeClass('light-class', 'dark-class'); // string
```

## Theme Modes

### Light Mode
- Explicitly sets light theme regardless of system preference
- Persisted in localStorage as `'light'`

### Dark Mode
- Explicitly sets dark theme regardless of system preference
- Persisted in localStorage as `'dark'`

### System Mode
- Follows the user's system preference (`prefers-color-scheme`)
- Automatically updates when system preference changes
- Persisted in localStorage as `'system'`

## CSS Integration

The theme system applies classes and data attributes to the document element:

```css
/* Theme classes */
html.light { /* light theme styles */ }
html.dark { /* dark theme styles */ }

/* Data attribute */
html[data-theme="light"] { /* light theme styles */ }
html[data-theme="dark"] { /* dark theme styles */ }
```

### Tailwind CSS Integration

Use Tailwind's dark mode classes:

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content that adapts to theme
</div>
```

## Advanced Usage

### Custom Storage Key

```tsx
<ThemeProvider storageKey="my-app-theme">
  <App />
</ThemeProvider>
```

### Disable System Theme Detection

```tsx
<ThemeProvider enableSystem={false}>
  <App />
</ThemeProvider>
```

### Theme Change Callbacks

```tsx
function MyComponent() {
  const { setTheme } = useTheme();
  
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    // Custom logic after theme change
    analytics.track('theme_changed', { theme: newTheme });
  };
  
  return (
    <button onClick={() => handleThemeChange('dark')}>
      Dark Mode
    </button>
  );
}
```

### Conditional Rendering Based on Theme

```tsx
function MyComponent() {
  const { resolvedTheme } = useTheme();
  
  return (
    <div>
      {resolvedTheme === 'dark' ? (
        <DarkModeIcon />
      ) : (
        <LightModeIcon />
      )}
    </div>
  );
}
```

## Accessibility

The theme system is designed with accessibility in mind:

- **Contrast Ratios**: Maintains WCAG AA contrast ratios in both themes
- **Screen Reader Support**: Theme changes can be announced to screen readers
- **Keyboard Navigation**: Theme toggle components support keyboard navigation
- **Focus Indicators**: Proper focus indicators in both themes

### Screen Reader Announcements

```tsx
function AccessibleThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    
    // Announce theme change to screen readers
    const announcement = `Theme changed to ${newTheme} mode`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.textContent = announcement;
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-10000px';
    document.body.appendChild(ariaLive);
    
    setTimeout(() => document.body.removeChild(ariaLive), 1000);
  };
  
  return (
    <button
      onClick={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      Toggle Theme
    </button>
  );
}
```

## Testing

The theme system includes comprehensive tests covering:

- Theme provider functionality
- Hook behavior and error handling
- System preference detection
- localStorage persistence
- Theme cycling and toggling
- SSR safety

Run tests with:

```bash
npm test test/theme/theme-system.test.tsx
```

## Troubleshooting

### Flash of Incorrect Theme (FOIT)

If you see a flash of the wrong theme on page load:

1. Add the theme script to your document head
2. Ensure the script runs before React hydration
3. Check that your CSS includes both theme variants

### Theme Not Persisting

If theme preferences aren't saved:

1. Check localStorage permissions
2. Verify the storage key is consistent
3. Ensure the ThemeProvider is not remounting

### System Theme Not Updating

If system theme changes aren't detected:

1. Ensure `enableSystem={true}` on ThemeProvider
2. Check browser support for `prefers-color-scheme`
3. Verify media query listeners are properly attached

## Browser Support

- **Modern Browsers**: Full support including system preference detection
- **Legacy Browsers**: Graceful fallback to light theme
- **SSR**: Safe initialization prevents hydration mismatches

## Performance

- **Minimal Re-renders**: Uses React context with memoized values
- **Efficient Storage**: Debounced localStorage writes
- **Memory Management**: Proper cleanup of event listeners
- **Bundle Size**: Lightweight with no external dependencies
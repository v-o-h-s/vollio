/**
 * Theme initialization script to prevent flash of incorrect theme (FOIT)
 * This script should be injected in the document head before the main app loads
 */

export const themeScript = `
(function() {
  try {
    var storageKey = 'noto-theme';
    var mediaQuery = '(prefers-color-scheme: dark)';
    
    // Get system preference
    var systemPreference = window.matchMedia(mediaQuery).matches ? 'dark' : 'light';
    
    // Get stored theme
    var storedTheme = localStorage.getItem(storageKey);
    var theme = storedTheme || 'system';
    
    // Resolve theme
    var resolvedTheme = theme === 'system' ? systemPreference : theme;
    
    // Apply theme immediately
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
    
    // Set a flag to indicate theme has been initialized
    root.setAttribute('data-theme-initialized', 'true');
  } catch (e) {
    // Fallback to light theme if anything fails
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

/**
 * Returns the theme script as a string for injection into HTML
 */
export function getThemeScript(): string {
  return themeScript;
}

/**
 * Creates a script element with the theme initialization code
 */
export function createThemeScriptElement(): HTMLScriptElement {
  const script = document.createElement('script');
  script.innerHTML = themeScript;
  return script;
}
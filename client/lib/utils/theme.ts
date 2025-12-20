    /**
 * Theme utility functions for managing light/dark mode
 */

type ThemeMode = "light" | "dark";

/**
 * Get the initial theme from localStorage or system preference
 */
export function getInitialTheme(
  defaultTheme: ThemeMode = "light",
  storageKey: string = "noto-theme"
): ThemeMode {
  // Check if we're on the client side
  if (typeof window === "undefined") {
    return defaultTheme;
  }

  try {
    // First, check localStorage
    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    // If no stored theme, check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch (error) {
    console.error("Error reading theme from localStorage:", error);
  }

  return defaultTheme;
}

/**
 * Store the theme preference in localStorage
 */
export function setStoredTheme(
  theme: ThemeMode,
  storageKey: string = "noto-theme"
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(storageKey, theme);
  } catch (error) {
    console.error("Error storing theme in localStorage:", error);
  }
}

/**
 * Apply the theme to the document root element
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove("light", "dark");

    // Add the current theme class
    root.classList.add(theme);

    // Also set a data attribute for CSS selectors
    root.setAttribute("data-theme", theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#0a0a0a" : "#ffffff"
      );
    }
  } catch (error) {
    console.error("Error applying theme:", error);
  }
}

/**
 * Listen for system theme changes
 */
export function watchSystemTheme(
  callback: (theme: ThemeMode) => void
): () => void {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches ? "dark" : "light");
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }

  // Fallback for older browsers
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }

  return () => {};
}

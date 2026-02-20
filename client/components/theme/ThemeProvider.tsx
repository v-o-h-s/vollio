"use client";

import React, { createContext, useEffect, useState, useCallback } from "react";

interface ThemeState {
  theme: ThemeMode;
  isInitialized: boolean;
}

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}
import {
  getInitialTheme,
  setStoredTheme,
  applyTheme,
  watchSystemTheme,
  ThemeMode,
} from "@/lib/utils/theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vollio-theme",
}: ThemeProviderProps) {
  const [state, setState] = useState<ThemeState>({
    theme: defaultTheme,
    isInitialized: false,
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Initialize theme on client side
  useEffect(() => {
    const initialTheme = getInitialTheme(defaultTheme, storageKey);
    setState({ theme: initialTheme, isInitialized: true });
  }, [defaultTheme, storageKey]);

  // Handle actual application of theme and system watching
  useEffect(() => {
    if (!state.isInitialized) return;

    if (state.theme === "system") {
      const updateSystemTheme = (newTheme: "light" | "dark") => {
        setResolvedTheme(newTheme);
        applyTheme(newTheme);
      };

      // Initial check
      const isDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      updateSystemTheme(isDark ? "dark" : "light");

      return watchSystemTheme(updateSystemTheme);
    } else {
      setResolvedTheme(state.theme);
      applyTheme(state.theme);
    }
  }, [state.theme, state.isInitialized]);

  // Set theme function
  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setState((prev) => ({ ...prev, theme: newTheme }));
      setStoredTheme(newTheme, storageKey);
    },
    [storageKey],
  );

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    const nextThemeMap: Record<ThemeMode, ThemeMode> = {
      light: "dark",
      dark: "system",
      system: "light",
    };
    setTheme(nextThemeMap[state.theme]);
  }, [state.theme, setTheme]);

  const contextValue: ThemeContextValue = {
    theme: state.theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext };

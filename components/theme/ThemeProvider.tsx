'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { 
  ThemeContextValue, 
  ThemeProviderProps, 
  ThemeState, 
  ThemeMode 
} from '@/lib/types/theme';
import {
  getInitialTheme,
  setStoredTheme,
  applyTheme,
} from '@/lib/utils/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'noto-theme',
}: ThemeProviderProps) {
  const [state, setState] = useState<ThemeState>(() => {
    // Initialize with safe defaults for SSR
    return {
      theme: defaultTheme,
      isInitialized: false,
    };
  });

  // Initialize theme on client side
  useEffect(() => {
    const initialTheme = getInitialTheme(defaultTheme, storageKey);
    
    setState({
      theme: initialTheme,
      isInitialized: true,
    });
    
    // Apply the initial theme
    applyTheme(initialTheme);
  }, [defaultTheme, storageKey]);

  // Set theme function
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setState((prev) => ({
      ...prev,
      theme: newTheme,
    }));
    
    // Apply and store the new theme
    applyTheme(newTheme);
    setStoredTheme(newTheme, storageKey);
  }, [storageKey]);

  // Toggle theme function (switches between light and dark)
  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [state.theme, setTheme]);

  const contextValue: ThemeContextValue = {
    theme: state.theme,
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
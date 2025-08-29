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
  createSystemPreferenceListener,
  resolveTheme,
} from '@/lib/utils/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'noto-theme',
  enableSystem = true,
}: ThemeProviderProps) {
  const [state, setState] = useState<ThemeState>(() => {
    // Initialize with safe defaults for SSR
    return {
      theme: defaultTheme,
      systemPreference: 'light',
      isInitialized: false,
    };
  });

  // Initialize theme on client side
  useEffect(() => {
    const initialConfig = getInitialTheme(defaultTheme, storageKey);
    
    setState({
      theme: initialConfig.theme,
      systemPreference: initialConfig.systemPreference,
      isInitialized: true,
    });
    
    // Apply the initial theme
    applyTheme(initialConfig.resolvedTheme);
  }, [defaultTheme, storageKey]);

  // Listen for system preference changes
  useEffect(() => {
    if (!enableSystem) return;

    const cleanup = createSystemPreferenceListener((newPreference) => {
      setState((prev) => {
        const newState = {
          ...prev,
          systemPreference: newPreference,
        };
        
        // If using system theme, apply the new preference
        if (prev.theme === 'system') {
          applyTheme(newPreference);
        }
        
        return newState;
      });
    });

    return cleanup;
  }, [enableSystem]);

  // Set theme function
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setState((prev) => {
      const newState = {
        ...prev,
        theme: newTheme,
      };
      
      // Resolve and apply the new theme
      const resolvedTheme = resolveTheme(newTheme, prev.systemPreference);
      applyTheme(resolvedTheme);
      
      // Store the preference
      setStoredTheme(newTheme, storageKey);
      
      return newState;
    });
  }, [storageKey]);

  // Toggle theme function (cycles through light -> dark -> system)
  const toggleTheme = useCallback(() => {
    setState((prev) => {
      let newTheme: ThemeMode;
      
      switch (prev.theme) {
        case 'light':
          newTheme = 'dark';
          break;
        case 'dark':
          newTheme = enableSystem ? 'system' : 'light';
          break;
        case 'system':
          newTheme = 'light';
          break;
        default:
          newTheme = 'light';
      }
      
      // Resolve and apply the new theme
      const resolvedTheme = resolveTheme(newTheme, prev.systemPreference);
      applyTheme(resolvedTheme);
      
      // Store the preference
      setStoredTheme(newTheme, storageKey);
      
      return {
        ...prev,
        theme: newTheme,
      };
    });
  }, [enableSystem, storageKey]);

  // Calculate resolved theme
  const resolvedTheme = resolveTheme(state.theme, state.systemPreference);

  const contextValue: ThemeContextValue = {
    theme: state.theme,
    resolvedTheme,
    systemPreference: state.systemPreference,
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
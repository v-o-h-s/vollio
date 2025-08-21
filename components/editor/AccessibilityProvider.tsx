'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  announcements: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigation: true,
    announcements: true,
  });

  // Detect system preferences
  useEffect(() => {
    const detectSystemPreferences = () => {
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setSettings(prev => ({
        ...prev,
        highContrast: highContrast || prev.highContrast,
        reducedMotion: reducedMotion || prev.reducedMotion,
      }));
    };

    detectSystemPreferences();

    // Listen for changes in system preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse saved accessibility settings:', error);
      }
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply accessibility classes to document
  useEffect(() => {
    const { documentElement } = document;
    
    // High contrast mode
    if (settings.highContrast) {
      documentElement.classList.add('high-contrast');
    } else {
      documentElement.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      documentElement.classList.add('reduced-motion');
    } else {
      documentElement.classList.remove('reduced-motion');
    }

    // Screen reader optimized
    if (settings.screenReaderOptimized) {
      documentElement.classList.add('screen-reader-optimized');
    } else {
      documentElement.classList.remove('screen-reader-optimized');
    }

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      documentElement.classList.add('keyboard-navigation');
    } else {
      documentElement.classList.remove('keyboard-navigation');
    }
  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const value: AccessibilityContextValue = {
    settings,
    updateSettings,
    announceToScreenReader,
    isHighContrast: settings.highContrast,
    isReducedMotion: settings.reducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Hook for managing focus
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      setFocusedElement(event.target as HTMLElement);
    };

    const handleBlur = () => {
      setFocusedElement(null);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  const moveFocusTo = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      return true;
    }
    return false;
  };

  const moveFocusToNext = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(focusedElement!);
    const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
    
    if (nextElement) {
      nextElement.focus();
      return true;
    }
    return false;
  };

  const moveFocusToPrevious = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(focusedElement!);
    const previousElement = focusableElements[currentIndex - 1] as HTMLElement;
    
    if (previousElement) {
      previousElement.focus();
      return true;
    }
    return false;
  };

  return {
    focusedElement,
    moveFocusTo,
    moveFocusToNext,
    moveFocusToPrevious,
  };
}
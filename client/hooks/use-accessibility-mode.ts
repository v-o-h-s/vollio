import { useState, useEffect, useCallback } from "react";

export type AccessibilityMode = 'standard' | 'high-contrast' | 'screen-reader';

interface AccessibilitySettings {
  mode: AccessibilityMode;
  announceChanges: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusIndicators: boolean;
  keyboardNavigation: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  mode: 'standard',
  announceChanges: true,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  focusIndicators: true,
  keyboardNavigation: true,
};

const STORAGE_KEY = 'vollio-accessibility-settings';

/**
 * Hook for managing accessibility settings and modes
 */
export function useAccessibilityMode() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize settings from localStorage and system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Load stored settings
      const stored = localStorage.getItem(STORAGE_KEY);
      let loadedSettings = DEFAULT_SETTINGS;
      
      if (stored) {
        loadedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }

      // Check system preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Apply system preferences if not explicitly set
      if (prefersReducedMotion) {
        loadedSettings.reducedMotion = true;
      }
      
      if (prefersHighContrast) {
        loadedSettings.highContrast = true;
        loadedSettings.mode = 'high-contrast';
      }

      setSettings(loadedSettings);
      applyAccessibilitySettings(loadedSettings);
      setIsInitialized(true);
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
      setIsInitialized(true);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AccessibilitySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Auto-update related settings
      if (key === 'highContrast' && value) {
        newSettings.mode = 'high-contrast';
      } else if (key === 'mode') {
        if (value === 'high-contrast') {
          newSettings.highContrast = true;
        } else if (value === 'screen-reader') {
          newSettings.announceChanges = true;
          newSettings.keyboardNavigation = true;
        }
      }
      
      applyAccessibilitySettings(newSettings);
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  // Toggle accessibility mode
  const toggleAccessibilityMode = useCallback(() => {
    const modes: AccessibilityMode[] = ['standard', 'high-contrast', 'screen-reader'];
    const currentIndex = modes.indexOf(settings.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    updateSetting('mode', nextMode);
  }, [settings.mode, updateSetting]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    applyAccessibilitySettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  // Announce text to screen readers
  const announce = useCallback((text: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announceChanges) return;

    // Create or update the live region
    let liveRegion = document.getElementById('accessibility-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-announcer';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(liveRegion);
    }

    // Update the live region content
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = text;
  }, [settings.announceChanges]);

  return {
    settings,
    isInitialized,
    updateSetting,
    toggleAccessibilityMode,
    resetSettings,
    announce,
  };
}

/**
 * Apply accessibility settings to the document
 */
function applyAccessibilitySettings(settings: AccessibilitySettings) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  // Remove existing accessibility classes
  root.classList.remove(
    'accessibility-standard',
    'accessibility-high-contrast', 
    'accessibility-screen-reader',
    'reduced-motion',
    'large-text',
    'enhanced-focus'
  );

  // Apply mode class
  root.classList.add(`accessibility-${settings.mode}`);

  // Apply individual setting classes
  if (settings.reducedMotion) {
    root.classList.add('reduced-motion');
  }
  
  if (settings.largeText) {
    root.classList.add('large-text');
  }
  
  if (settings.focusIndicators) {
    root.classList.add('enhanced-focus');
  }

  // Set CSS custom properties for fine-grained control
  root.style.setProperty('--accessibility-high-contrast', settings.highContrast ? '1' : '0');
  root.style.setProperty('--accessibility-reduced-motion', settings.reducedMotion ? '1' : '0');
  root.style.setProperty('--accessibility-large-text', settings.largeText ? '1' : '0');
  
  // Update data attributes for CSS selectors
  root.setAttribute('data-accessibility-mode', settings.mode);
  root.setAttribute('data-high-contrast', settings.highContrast.toString());
  root.setAttribute('data-reduced-motion', settings.reducedMotion.toString());
}

/**
 * Get accessibility-aware class names
 */
export function getAccessibilityClasses(baseClasses: string, accessibilityMode?: AccessibilityMode): string {
  if (!accessibilityMode || accessibilityMode === 'standard') {
    return baseClasses;
  }

  const classes = [baseClasses];
  
  if (accessibilityMode === 'high-contrast') {
    classes.push('accessibility-high-contrast');
  } else if (accessibilityMode === 'screen-reader') {
    classes.push('accessibility-screen-reader');
  }

  return classes.join(' ');
}
'use client';

import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * Demo component to test theme functionality
 */
export function ThemeDemo() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-xl font-bold mb-4">Theme System Demo</h2>
      
      <div className="space-y-2 mb-4">
        <p><strong>Current Theme:</strong> {theme}</p>
        <p><strong>Is Dark Mode:</strong> {isDarkMode ? 'Yes' : 'No'}</p>
      </div>

      <div className="space-x-2 mb-4">
        <button
          onClick={() => setTheme('light')}
          className={`px-3 py-1 rounded ${
            theme === 'light' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Light
        </button>
        
        <button
          onClick={() => setTheme('dark')}
          className={`px-3 py-1 rounded ${
            theme === 'dark' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Dark
        </button>
      </div>

      <button
        onClick={toggleTheme}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Toggle Theme
      </button>

      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold">Theme Toggle Components</h3>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Button Variant:</span>
          <ThemeToggle variant="button" size="sm" />
          <ThemeToggle variant="button" size="md" />
          <ThemeToggle variant="button" size="lg" />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Switch Variant:</span>
          <ThemeToggle variant="switch" size="sm" />
          <ThemeToggle variant="switch" size="md" />
          <ThemeToggle variant="switch" size="lg" />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Dropdown Variant:</span>
          <ThemeToggle variant="dropdown" size="sm" />
          <ThemeToggle variant="dropdown" size="md" />
          <ThemeToggle variant="dropdown" size="lg" />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">With Labels:</span>
          <ThemeToggle variant="button" size="md" showLabel />
          <ThemeToggle variant="switch" size="md" showLabel />
          <ThemeToggle variant="dropdown" size="md" showLabel />
        </div>
      </div>

      <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-800">
        <p className="text-sm">
          This box demonstrates theme-aware styling. It should change colors based on the current theme.
        </p>
      </div>
    </div>
  );
}

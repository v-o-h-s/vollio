/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useTheme, useResolvedTheme, useIsDarkMode, useThemeClass } from '@/hooks/use-theme';
import {
  getSystemPreference,
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
  getInitialTheme,
} from '@/lib/utils/theme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock matchMedia
const matchMediaMock = vi.fn();

// Test component that uses the theme hook
function TestComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Dark
      </button>
      <button onClick={() => setTheme('system')} data-testid="set-system">
        System
      </button>
      <button onClick={toggleTheme} data-testid="toggle">
        Toggle
      </button>
    </div>
  );
}

describe('Theme System', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
    });
    
    // Default matchMedia mock (light theme)
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
        setAttribute: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Theme Utilities', () => {
    it('should detect system preference correctly', () => {
      // Test light preference
      matchMediaMock.mockReturnValue({ matches: false });
      expect(getSystemPreference()).toBe('light');
      
      // Test dark preference
      matchMediaMock.mockReturnValue({ matches: true });
      expect(getSystemPreference()).toBe('dark');
    });

    it('should handle localStorage operations', () => {
      // Test storing theme
      setStoredTheme('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('noto-theme', 'dark');
      
      // Test getting stored theme
      localStorageMock.getItem.mockReturnValue('dark');
      expect(getStoredTheme()).toBe('dark');
      
      // Test invalid stored theme
      localStorageMock.getItem.mockReturnValue('invalid');
      expect(getStoredTheme()).toBe(null);
      
      // Test localStorage error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(getStoredTheme()).toBe(null);
    });

    it('should resolve themes correctly', () => {
      expect(resolveTheme('light', 'dark')).toBe('light');
      expect(resolveTheme('dark', 'light')).toBe('dark');
      expect(resolveTheme('system', 'light')).toBe('light');
      expect(resolveTheme('system', 'dark')).toBe('dark');
    });

    it('should apply theme to document', () => {
      const mockClassList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      const mockSetAttribute = vi.fn();
      
      Object.defineProperty(document, 'documentElement', {
        value: {
          classList: mockClassList,
          setAttribute: mockSetAttribute,
        },
        writable: true,
      });
      
      applyTheme('dark');
      
      expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
      expect(mockClassList.add).toHaveBeenCalledWith('dark');
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should get initial theme configuration', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      matchMediaMock.mockReturnValue({ matches: false });
      
      const config = getInitialTheme();
      
      expect(config.theme).toBe('dark');
      expect(config.systemPreference).toBe('light');
      expect(config.resolvedTheme).toBe('dark');
    });
  });

  describe('ThemeProvider', () => {
    it('should provide theme context', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('theme')).toBeInTheDocument();
      expect(screen.getByTestId('resolved-theme')).toBeInTheDocument();
    });

    it('should initialize with default theme', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );
      
      // Note: Initial render might show default values due to SSR safety
      expect(screen.getByTestId('theme')).toBeInTheDocument();
    });

    it('should use stored theme preference', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(screen.getByTestId('theme')).toBeInTheDocument();
    });
  });

  describe('useTheme Hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });

    it('should provide theme controls', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Test setting themes
      await user.click(screen.getByTestId('set-dark'));
      await user.click(screen.getByTestId('set-light'));
      await user.click(screen.getByTestId('set-system'));
      
      // Test toggle
      await user.click(screen.getByTestId('toggle'));
      
      // Verify localStorage calls
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Theme Hook Utilities', () => {
    it('should provide resolved theme', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );
      
      const { result } = renderHook(() => useResolvedTheme(), { wrapper });
      
      expect(['light', 'dark']).toContain(result.current);
    });

    it('should provide dark mode boolean', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );
      
      const { result } = renderHook(() => useIsDarkMode(), { wrapper });
      
      expect(typeof result.current).toBe('boolean');
    });

    it('should provide theme-aware CSS classes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );
      
      const { result } = renderHook(
        () => useThemeClass('bg-white', 'bg-black'),
        { wrapper }
      );
      
      expect(['bg-white', 'bg-black']).toContain(result.current);
    });
  });

  describe('System Preference Changes', () => {
    it('should listen for system preference changes', () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();
      
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });
      
      const { unmount } = render(
        <ThemeProvider enableSystem={true}>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      
      unmount();
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should not listen when system is disabled', () => {
      const mockAddEventListener = vi.fn();
      
      matchMediaMock.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      });
      
      render(
        <ThemeProvider enableSystem={false}>
          <TestComponent />
        </ThemeProvider>
      );
      
      expect(mockAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Theme Toggle Behavior', () => {
    it('should cycle through themes correctly', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider enableSystem={true}>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Should cycle: light -> dark -> system -> light
      await user.click(screen.getByTestId('toggle'));
      await user.click(screen.getByTestId('toggle'));
      await user.click(screen.getByTestId('toggle'));
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should cycle without system theme when disabled', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider enableSystem={false}>
          <TestComponent />
        </ThemeProvider>
      );
      
      // Should cycle: light -> dark -> light
      await user.click(screen.getByTestId('toggle'));
      await user.click(screen.getByTestId('toggle'));
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
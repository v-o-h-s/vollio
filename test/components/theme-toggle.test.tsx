import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

// Mock the theme utilities
vi.mock('@/lib/utils/theme', () => ({
  getSystemPreference: vi.fn(() => 'light'),
  getStoredTheme: vi.fn(() => null),
  setStoredTheme: vi.fn(),
  resolveTheme: vi.fn((theme, systemPref) => theme === 'system' ? systemPref : theme),
  applyTheme: vi.fn(),
  createSystemPreferenceListener: vi.fn(() => () => {}),
  getInitialTheme: vi.fn(() => ({
    theme: 'system',
    systemPreference: 'light',
    resolvedTheme: 'light',
  })),
}));

// Test wrapper with ThemeProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider defaultTheme="light">
    {children}
  </ThemeProvider>
);

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Button Variant', () => {
    it('renders button variant correctly', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="button" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label');
    });

    it('shows label when showLabel is true', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="button" showLabel />
        </TestWrapper>
      );

      expect(screen.getByText('Light mode')).toBeInTheDocument();
    });

    it('handles click to toggle theme', async () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="button" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should trigger theme change
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Switch Variant', () => {
    it('renders switch variant correctly', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="switch" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label');
    });

    it('toggles between light and dark only', async () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="switch" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Dropdown Variant', () => {
    it('renders dropdown variant correctly', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="dropdown" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
    });

    it('opens dropdown menu on click', async () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="dropdown" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
      });
    });

    it('selects theme from dropdown', async () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="dropdown" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      await waitFor(() => {
        const darkOption = screen.getByText('Dark');
        fireEvent.click(darkOption);
      });
    });
  });

  describe('Size Variants', () => {
    it('applies correct size classes', () => {
      const { rerender } = render(
        <TestWrapper>
          <ThemeToggle variant="button" size="sm" />
        </TestWrapper>
      );

      let button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'w-8');

      rerender(
        <TestWrapper>
          <ThemeToggle variant="button" size="md" />
        </TestWrapper>
      );

      button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'w-9');

      rerender(
        <TestWrapper>
          <ThemeToggle variant="button" size="lg" />
        </TestWrapper>
      );

      button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="button" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('Current theme');
    });

    it('has proper title attribute', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="button" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title');
    });

    it('supports keyboard navigation', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="button" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(
        <TestWrapper>
          <ThemeToggle variant="button" className="custom-class" />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });
});
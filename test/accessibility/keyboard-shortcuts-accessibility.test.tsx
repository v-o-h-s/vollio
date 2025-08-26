import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotionEditor } from '@/components/editor/NotionEditor';
import { MultiModeEditor } from '@/components/editor/MultiModeEditor';
import { KeyboardShortcutsDialog } from '@/components/editor/KeyboardShortcutsDialog';
import { AccessibilityProvider } from '@/components/editor/AccessibilityProvider';

// Mock TipTap editor
vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    commands: {
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      toggleHeading: vi.fn(),
      focus: vi.fn(),
      selectAll: vi.fn(),
    },
    isActive: vi.fn(() => false),
    getJSON: vi.fn(() => ({})),
    getText: vi.fn(() => 'Sample text'),
    setEditable: vi.fn(),
    destroy: vi.fn(),
    view: { dom: document.createElement('div') },
  }),
  EditorContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('@/hooks/use-mobile-editor', () => ({
  useMobileEditor: () => ({
    containerRef: { current: null },
    handleInputFocus: vi.fn(),
    handleInputBlur: vi.fn(),
    preventZoom: vi.fn(),
    isKeyboardVisible: false,
    keyboardHeight: 0,
    viewportHeight: 1000,
    isGestureActive: false,
    hapticFeedback: { success: vi.fn() },
  }),
  useMobileEditorEnhancements: vi.fn(),
}));

describe('Keyboard Shortcuts and Accessibility', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear any existing announcements
    document.querySelectorAll('[aria-live]').forEach(el => el.remove());
  });

  describe('MultiModeEditor Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <MultiModeEditor mode="normal">
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const editor = screen.getByRole('application');
      expect(editor).toHaveAttribute('aria-label', 'Rich text editor in normal mode');
      expect(editor).toHaveAttribute('aria-describedby');
    });

    it('should announce mode changes to screen readers', async () => {
      const onModeChange = vi.fn();
      render(
        <MultiModeEditor mode="normal" onModeChange={onModeChange}>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      // Simulate F11 key press for focus mode
      fireEvent.keyDown(document, { key: 'F11' });

      await waitFor(() => {
        const announcement = document.querySelector('[aria-live="assertive"]');
        expect(announcement).toBeInTheDocument();
        expect(announcement).toHaveTextContent('Focus mode activated');
      });
    });

    it('should support keyboard navigation for mode toggles', async () => {
      render(
        <MultiModeEditor mode="normal" showModeToggle>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const normalButton = screen.getByRole('button', { name: /normal/i });
      const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });

      // Focus normal button and navigate with arrow keys
      normalButton.focus();
      await user.keyboard('{ArrowRight}');

      expect(fullscreenButton).toHaveFocus();
    });

    it('should trap focus in focus mode', async () => {
      render(
        <MultiModeEditor mode="focus">
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const exitButton = screen.getByRole('button', { name: /exit focus mode/i });
      expect(exitButton).toHaveFocus();
    });

    it('should provide proper status information', () => {
      render(
        <MultiModeEditor 
          mode="normal" 
          showWordCount 
          showReadingTime 
          wordCount={150} 
          readingTime={1}
        >
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const statusBar = screen.getByRole('status');
      expect(statusBar).toHaveAttribute('aria-label', 'Editor statistics and mode information');
      
      const wordCount = screen.getByText('150');
      expect(wordCount).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle F11 for focus mode toggle', async () => {
      const onModeChange = vi.fn();
      render(
        <MultiModeEditor mode="normal" onModeChange={onModeChange}>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      fireEvent.keyDown(document, { key: 'F11' });
      expect(onModeChange).toHaveBeenCalledWith('focus');
    });

    it('should handle Escape to exit focus mode', async () => {
      const onModeChange = vi.fn();
      render(
        <MultiModeEditor mode="focus" onModeChange={onModeChange}>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onModeChange).toHaveBeenCalledWith('normal');
    });

    it('should handle Ctrl+Shift+F for fullscreen toggle', async () => {
      const onModeChange = vi.fn();
      render(
        <MultiModeEditor mode="normal" onModeChange={onModeChange}>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      fireEvent.keyDown(document, { 
        key: 'F', 
        ctrlKey: true, 
        shiftKey: true 
      });
      expect(onModeChange).toHaveBeenCalledWith('fullscreen');
    });

    it('should handle Alt+M for mode selection focus', async () => {
      render(
        <MultiModeEditor mode="normal" showModeToggle>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      fireEvent.keyDown(document, { key: 'm', altKey: true });

      await waitFor(() => {
        const modeButton = screen.getByRole('button', { name: /normal/i });
        expect(modeButton).toHaveFocus();
      });
    });
  });

  describe('KeyboardShortcutsDialog Accessibility', () => {
    it('should have proper ARIA structure', () => {
      render(
        <KeyboardShortcutsDialog isOpen={true} onClose={vi.fn()} />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'keyboard-shortcuts-description');

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Shortcut categories');

      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls', 'shortcuts-content');
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should support keyboard navigation between categories', async () => {
      render(
        <KeyboardShortcutsDialog isOpen={true} onClose={vi.fn()} />
      );

      const firstTab = screen.getByRole('tab', { name: /all shortcuts/i });
      const secondTab = screen.getByRole('tab', { name: /text formatting/i });

      firstTab.focus();
      await user.keyboard('{ArrowRight}');

      expect(secondTab).toHaveFocus();
      expect(secondTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should provide accessible shortcut information', () => {
      render(
        <KeyboardShortcutsDialog isOpen={true} onClose={vi.fn()} />
      );

      const shortcutItems = screen.getAllByRole('listitem');
      shortcutItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label');
        expect(item.getAttribute('aria-label')).toMatch(/keyboard shortcut:/);
      });
    });

    it('should handle search functionality accessibly', async () => {
      render(
        <KeyboardShortcutsDialog isOpen={true} onClose={vi.fn()} />
      );

      const searchInput = screen.getByRole('textbox', { name: /search keyboard shortcuts/i });
      expect(searchInput).toBeInTheDocument();

      await user.type(searchInput, 'bold');
      
      // Should filter shortcuts and maintain accessibility
      const shortcutItems = screen.getAllByRole('listitem');
      expect(shortcutItems.length).toBeGreaterThan(0);
    });
  });

  describe('NotionEditor Accessibility Integration', () => {
    it('should integrate accessibility features properly', () => {
      render(
        <AccessibilityProvider>
          <NotionEditor content="" onChange={vi.fn()} />
        </AccessibilityProvider>
      );

      // Check for accessibility button
      const accessibilityButton = screen.getByRole('button', { 
        name: /open accessibility settings/i 
      });
      expect(accessibilityButton).toBeInTheDocument();
      expect(accessibilityButton).toHaveAttribute('aria-label');
    });

    it('should handle Alt+A for accessibility settings', async () => {
      render(
        <AccessibilityProvider>
          <NotionEditor content="" onChange={vi.fn()} />
        </AccessibilityProvider>
      );

      fireEvent.keyDown(document, { key: 'a', altKey: true });

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('should provide skip links for keyboard users', () => {
      render(
        <AccessibilityProvider>
          <NotionEditor content="" onChange={vi.fn()} />
        </AccessibilityProvider>
      );

      const skipLink = screen.getByText(/skip to editor content/i);
      expect(skipLink).toHaveClass('skip-link');
      expect(skipLink).toHaveAttribute('href', '#editor-content');
    });

    it('should announce editor state changes', async () => {
      const onChange = vi.fn();
      render(
        <AccessibilityProvider>
          <NotionEditor content="" onChange={onChange} />
        </AccessibilityProvider>
      );

      // Simulate distraction-free mode toggle
      fireEvent.keyDown(document, { 
        key: 'D', 
        ctrlKey: true, 
        shiftKey: true 
      });

      await waitFor(() => {
        const announcement = document.querySelector('[aria-live]');
        expect(announcement).toHaveTextContent(/distraction-free mode/i);
      });
    });
  });

  describe('WCAG AA Compliance', () => {
    it('should have sufficient color contrast in high contrast mode', () => {
      document.documentElement.classList.add('high-contrast');
      
      render(
        <MultiModeEditor mode="normal">
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const editor = screen.getByRole('application');
      const styles = window.getComputedStyle(editor);
      
      // In high contrast mode, colors should be black/white
      expect(styles.getPropertyValue('--background')).toBe('#000000');
      expect(styles.getPropertyValue('--foreground')).toBe('#ffffff');
      
      document.documentElement.classList.remove('high-contrast');
    });

    it('should respect reduced motion preferences', () => {
      document.documentElement.classList.add('reduced-motion');
      
      render(
        <MultiModeEditor mode="normal">
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const animatedElements = document.querySelectorAll('*');
      animatedElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const animationDuration = styles.animationDuration;
        const transitionDuration = styles.transitionDuration;
        
        // Should have minimal animation/transition duration
        if (animationDuration !== '' && animationDuration !== '0s') {
          expect(animationDuration).toBe('0.01ms');
        }
        if (transitionDuration !== '' && transitionDuration !== '0s') {
          expect(transitionDuration).toBe('0.01ms');
        }
      });
      
      document.documentElement.classList.remove('reduced-motion');
    });

    it('should have proper focus indicators', async () => {
      document.documentElement.classList.add('keyboard-navigation');
      
      render(
        <MultiModeEditor mode="normal" showModeToggle>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const button = screen.getByRole('button', { name: /normal/i });
      button.focus();

      // Should have visible focus indicator
      expect(button).toHaveClass('mode-toggle-button');
      
      document.documentElement.classList.remove('keyboard-navigation');
    });

    it('should have minimum touch target sizes on mobile', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      render(
        <MultiModeEditor mode="focus">
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const exitButton = screen.getByRole('button', { name: /exit focus mode/i });
      const styles = window.getComputedStyle(exitButton);
      
      // Should have minimum 44px touch target
      const minHeight = parseInt(styles.minHeight);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide comprehensive ARIA labels', () => {
      render(
        <MultiModeEditor mode="normal" showModeToggle showWordCount>
          <div>Editor content</div>
        </MultiModeEditor>
      );

      // Check for proper labeling
      const editor = screen.getByRole('application');
      expect(editor).toHaveAttribute('aria-label');

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label');

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label');
    });

    it('should provide live region updates', async () => {
      render(
        <MultiModeEditor 
          mode="normal" 
          showWordCount 
          wordCount={100}
        >
          <div>Editor content</div>
        </MultiModeEditor>
      );

      const wordCountElement = screen.getByText('100');
      expect(wordCountElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper heading structure', () => {
      render(
        <KeyboardShortcutsDialog isOpen={true} onClose={vi.fn()} />
      );

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent(/keyboard shortcuts/i);
    });
  });
});
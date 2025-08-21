'use client';

import { useEffect, useCallback, useState } from 'react';
import type { Editor } from '@tiptap/react';

export interface EditorKeyboardShortcutsOptions {
  editor: Editor | null;
  enabled?: boolean;
  onShowHelp?: () => void;
  onOpenLinkDialog?: () => void;
}

/**
 * Hook for managing editor-specific keyboard shortcuts and help system
 */
export function useEditorKeyboardShortcuts({
  editor,
  enabled = true,
  onShowHelp,
  onOpenLinkDialog,
}: EditorKeyboardShortcutsOptions) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Handle custom keyboard events
  const handleKeyboardEvents = useCallback((event: Event) => {
    if (!enabled || !editor) return;

    const customEvent = event as CustomEvent;
    
    switch (customEvent.type) {
      case 'showKeyboardHelp':
        setIsHelpOpen(true);
        onShowHelp?.();
        break;
      case 'openLinkDialog':
        onOpenLinkDialog?.();
        break;
      case 'showAccessibilitySettings':
        // Dispatch event to open accessibility settings
        const accessibilityEvent = new CustomEvent('openAccessibilitySettings');
        document.dispatchEvent(accessibilityEvent);
        break;
    }
  }, [enabled, editor, onShowHelp, onOpenLinkDialog]);

  // Global keyboard shortcut handler for editor-specific shortcuts
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !editor) return;

    // Don't handle shortcuts when editor is not focused or in input fields
    const target = event.target as HTMLElement;
    const isInEditor = target.closest('[data-tiptap-editor]') !== null;
    const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    
    if (!isInEditor && !isInInput) return;

    const isMod = event.ctrlKey || event.metaKey;

    // Help shortcut (Cmd/Ctrl + /)
    if (isMod && event.key === '/') {
      event.preventDefault();
      setIsHelpOpen(true);
      onShowHelp?.();
      return;
    }

    // Focus editor shortcut (Cmd/Ctrl + ')
    if (isMod && event.key === "'") {
      event.preventDefault();
      editor.commands.focus();
      return;
    }

    // Quick block shortcuts when editor is focused
    if (isInEditor) {
      // Quick heading shortcuts (Cmd/Ctrl + 1-3)
      if (isMod && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault();
        const level = parseInt(event.key) as 1 | 2 | 3;
        editor.commands.toggleHeading({ level });
        return;
      }

      // Quick paragraph (Cmd/Ctrl + 0)
      if (isMod && event.key === '0') {
        event.preventDefault();
        editor.commands.setParagraph();
        return;
      }
    }
  }, [enabled, editor, onShowHelp]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    // Listen for custom events
    document.addEventListener('showKeyboardHelp', handleKeyboardEvents);
    document.addEventListener('openLinkDialog', handleKeyboardEvents);
    document.addEventListener('showAccessibilitySettings', handleKeyboardEvents);
    
    // Listen for global keyboard events
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('showKeyboardHelp', handleKeyboardEvents);
      document.removeEventListener('openLinkDialog', handleKeyboardEvents);
      document.removeEventListener('showAccessibilitySettings', handleKeyboardEvents);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleKeyboardEvents, handleGlobalKeyDown, enabled]);

  // Add data attribute to editor for keyboard shortcut detection
  useEffect(() => {
    if (editor) {
      const editorElement = editor.view.dom;
      editorElement.setAttribute('data-tiptap-editor', 'true');
      
      return () => {
        editorElement.removeAttribute('data-tiptap-editor');
      };
    }
  }, [editor]);

  return {
    isHelpOpen,
    setIsHelpOpen,
    showHelp: () => setIsHelpOpen(true),
    hideHelp: () => setIsHelpOpen(false),
  };
}

/**
 * Hook for managing editor accessibility features
 */
export function useEditorAccessibility(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;
    
    // Set up accessibility attributes
    editorElement.setAttribute('role', 'textbox');
    editorElement.setAttribute('aria-multiline', 'true');
    editorElement.setAttribute('aria-label', 'Rich text editor');
    
    // Add keyboard navigation hints
    editorElement.setAttribute('aria-describedby', 'editor-keyboard-help');
    
    // Handle focus management
    const handleFocus = () => {
      editorElement.setAttribute('aria-expanded', 'true');
    };
    
    const handleBlur = () => {
      editorElement.setAttribute('aria-expanded', 'false');
    };
    
    editorElement.addEventListener('focus', handleFocus);
    editorElement.addEventListener('blur', handleBlur);
    
    return () => {
      editorElement.removeEventListener('focus', handleFocus);
      editorElement.removeEventListener('blur', handleBlur);
    };
  }, [editor]);

  // Announce editor state changes to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    announceToScreenReader,
  };
}
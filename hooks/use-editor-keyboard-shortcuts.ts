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

    
    // Listen for global keyboard events
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('showKeyboardHelp', handleKeyboardEvents);
      document.removeEventListener('openLinkDialog', handleKeyboardEvents);

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


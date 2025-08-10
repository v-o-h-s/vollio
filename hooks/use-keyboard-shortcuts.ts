"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Supports common modifier keys and provides accessibility features
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatches =
          shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = (shortcut.ctrlKey ?? false) === event.ctrlKey;
        const altMatches = (shortcut.altKey ?? false) === event.altKey;
        const shiftMatches = (shortcut.shiftKey ?? false) === event.shiftKey;
        const metaMatches = (shortcut.metaKey ?? false) === event.metaKey;

        return (
          keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches
        );
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
        }
        matchingShortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts: shortcuts.map((shortcut) => ({
      ...shortcut,
      displayKey: formatShortcutDisplay(shortcut),
    })),
  };
}

/**
 * Format keyboard shortcut for display in UI
 */
function formatShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  // Use Cmd on Mac, Ctrl on other platforms
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  if (shortcut.ctrlKey) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.altKey) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (shortcut.shiftKey) {
    parts.push("⇧");
  }
  if (shortcut.metaKey) {
    parts.push("⌘");
  }

  // Format key display
  const keyDisplay =
    shortcut.key.length === 1
      ? shortcut.key.toUpperCase()
      : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);

  parts.push(keyDisplay);

  return parts.join(isMac ? "" : "+");
}

/**
 * Hook for annotation-specific keyboard shortcuts
 */
export function useAnnotationKeyboardShortcuts({
  onCreateNote,
  onSaveNote,
  onCancelNote,
  onDeleteNote,
  onNavigateNext,
  onNavigatePrevious,
  onToggleSearch,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  enabled = true,
}: {
  onCreateNote?: () => void;
  onSaveNote?: () => void;
  onCancelNote?: () => void;
  onDeleteNote?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onToggleSearch?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // Note creation and editing
    {
      key: "n",
      ctrlKey: true,
      action: () => onCreateNote?.(),
      description: "Create new note",
    },
    {
      key: "s",
      ctrlKey: true,
      action: () => onSaveNote?.(),
      description: "Save current note",
    },
    {
      key: "Escape",
      action: () => onCancelNote?.(),
      description: "Cancel current action",
    },
    {
      key: "Delete",
      action: () => onDeleteNote?.(),
      description: "Delete selected annotation",
    },

    // Navigation
    {
      key: "ArrowRight",
      ctrlKey: true,
      action: () => onNavigateNext?.(),
      description: "Next annotation",
    },
    {
      key: "ArrowLeft",
      ctrlKey: true,
      action: () => onNavigatePrevious?.(),
      description: "Previous annotation",
    },

    // Search and view
    {
      key: "f",
      ctrlKey: true,
      action: () => onToggleSearch?.(),
      description: "Toggle search",
    },
    {
      key: "=",
      ctrlKey: true,
      action: () => onZoomIn?.(),
      description: "Zoom in",
    },
    {
      key: "-",
      ctrlKey: true,
      action: () => onZoomOut?.(),
      description: "Zoom out",
    },
    {
      key: "0",
      ctrlKey: true,
      action: () => onZoomReset?.(),
      description: "Reset zoom",
    },
  ].filter((shortcut) => {
    // Only include shortcuts that have corresponding actions
    return shortcut.action !== undefined;
  });

  return useKeyboardShortcuts({ shortcuts, enabled });
}

import { useEffect, useRef } from "react";

type KeyboardShortcut = string;
type ShortcutHandler = (event: KeyboardEvent) => void;
type ShortcutMap = Record<KeyboardShortcut, ShortcutHandler>;

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  target?: HTMLElement | Document | null;
}

/**
 * Hook for handling keyboard shortcuts
 * 
 * Supported modifiers:
 * - mod: Ctrl on Windows/Linux, Cmd on Mac
 * - ctrl: Ctrl key
 * - cmd: Cmd key (Mac only)
 * - alt: Alt key
 * - shift: Shift key
 * 
 * Examples:
 * - "mod+s": Ctrl+S on Windows, Cmd+S on Mac
 * - "ctrl+shift+p": Ctrl+Shift+P
 * - "escape": Escape key
 * - "enter": Enter key
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    target,
  } = options;

  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const eventTarget = target || document;

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = getShortcutFromEvent(event);
      const handler = shortcutsRef.current[shortcut];

      if (handler) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        handler(event);
      }
    };

    eventTarget.addEventListener("keydown", handleKeyDown);

    return () => {
      eventTarget.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, preventDefault, stopPropagation, target]);
}

function getShortcutFromEvent(event: KeyboardEvent): string {
  const parts: string[] = [];
  
  // Handle modifiers
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (event.ctrlKey && !isMac) {
    parts.push("ctrl");
  }
  
  if (event.metaKey && isMac) {
    parts.push("cmd");
  }
  
  // Handle "mod" key (Ctrl on Windows/Linux, Cmd on Mac)
  if ((event.ctrlKey && !isMac) || (event.metaKey && isMac)) {
    // We'll replace this with "mod" later if the shortcut uses "mod"
  }
  
  if (event.altKey) {
    parts.push("alt");
  }
  
  if (event.shiftKey) {
    parts.push("shift");
  }

  // Handle the main key
  const key = event.key.toLowerCase();
  
  // Special key mappings
  const keyMap: Record<string, string> = {
    " ": "space",
    "arrowup": "up",
    "arrowdown": "down",
    "arrowleft": "left",
    "arrowright": "right",
  };
  
  const mappedKey = keyMap[key] || key;
  parts.push(mappedKey);

  const shortcut = parts.join("+");
  
  // Handle "mod" shortcut by creating both versions
  const modShortcut = shortcut
    .replace("ctrl+", "mod+")
    .replace("cmd+", "mod+");
    
  return modShortcut;
}

/**
 * Utility function to format shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  return shortcut
    .split("+")
    .map(part => {
      switch (part) {
        case "mod":
          return isMac ? "⌘" : "Ctrl";
        case "ctrl":
          return isMac ? "⌃" : "Ctrl";
        case "cmd":
          return "⌘";
        case "alt":
          return isMac ? "⌥" : "Alt";
        case "shift":
          return isMac ? "⇧" : "Shift";
        case "enter":
          return "↵";
        case "escape":
          return "Esc";
        case "space":
          return "Space";
        case "up":
          return "↑";
        case "down":
          return "↓";
        case "left":
          return "←";
        case "right":
          return "→";
        default:
          return part.toUpperCase();
      }
    })
    .join(isMac ? "" : "+");
}
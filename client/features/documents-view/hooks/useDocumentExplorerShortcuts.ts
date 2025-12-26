import { useEffect } from "react";

interface UseDocumentExplorerShortcutsProps {
  onSelectAll: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  onEscape: () => void;
  enabled?: boolean;
}

export function useDocumentExplorerShortcuts({
  onSelectAll,
  onDelete,
  onClearSelection,
  onEscape,
  enabled = true,
}: UseDocumentExplorerShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + A - Select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        onSelectAll();
      }

      // Delete or Backspace - Delete selected items
      if (e.key === "Delete" || (e.key === "Backspace" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        onDelete();
      }

      // Escape - Clear selection and close menus
      if (e.key === "Escape") {
        onEscape();
      }

      // Ctrl/Cmd + D - Clear selection
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        onClearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectAll, onDelete, onClearSelection, onEscape, enabled]);
}

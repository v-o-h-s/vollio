import { useEffect } from "react";
import { shortcuts } from "@/lib/shortcuts";

type Scope = keyof typeof shortcuts; // dynamic type
type Handlers = Record<string, () => void>;

export default function useShortcuts(scope: Scope, handlers: Handlers) {
  useEffect(() => {
    const shortcutsList = shortcuts[scope];

    const handleKeyDown = (e: KeyboardEvent) => {
      const combo = [
        e.ctrlKey ? "Ctrl" : "",
        e.shiftKey ? "Shift" : "",
        e.altKey ? "Alt" : "",
        e.metaKey ? "Meta" : "",
        e.key.length === 1 ? e.key.toUpperCase() : e.key,
      ]
        .filter(Boolean)
        .join("+");

      const match = shortcutsList.find(
        (s) => s.key.toLowerCase() === combo.toLowerCase()
      );

      if (match) {
        e.preventDefault();
        const actionFn = handlers[match.action];
        if (actionFn) actionFn();
      }
    };

    // ✅ Attach listener ONCE per effect
    window.addEventListener("keydown", handleKeyDown);

    // ✅ Cleanup when dependencies change or component unmounts
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers, scope]);
}

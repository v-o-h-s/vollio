import React from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsHelpProps {
    shortcuts: ReturnType<typeof useKeyboardShortcuts>["shortcuts"];
}

/**
 * Component to display keyboard shortcuts help
 */
export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Keyboard Shortcuts
            </h3>
            {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                        {shortcut.displayKey}
                    </kbd>
                </div>
            ))}
        </div>
    );
}
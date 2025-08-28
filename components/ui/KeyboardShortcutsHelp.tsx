import React from "react";
import { formatShortcut } from "@/hooks/use-keyboard-shortcuts";

interface ShortcutInfo {
    key: string;
    description: string;
}

interface KeyboardShortcutsHelpProps {
    shortcuts: ShortcutInfo[];
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
                        {formatShortcut(shortcut.key)}
                    </kbd>
                </div>
            ))}
        </div>
    );
}
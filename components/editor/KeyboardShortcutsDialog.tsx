'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EDITOR_SHORTCUTS, type EditorKeyboardShortcut } from './extensions/KeyboardShortcuts';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Reset search when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Group shortcuts by category
  const groupedShortcuts = EDITOR_SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, EditorKeyboardShortcut[]>);

  // Filter shortcuts based on search and category
  const filteredShortcuts = Object.entries(groupedShortcuts).reduce((acc, [category, shortcuts]) => {
    if (selectedCategory !== 'all' && category !== selectedCategory) {
      return acc;
    }

    const filtered = shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length > 0) {
      acc[category] = filtered;
    }

    return acc;
  }, {} as Record<string, EditorKeyboardShortcut[]>);

  const categories = [
    { value: 'all', label: 'All Shortcuts', icon: '⌨️' },
    { value: 'formatting', label: 'Text Formatting', icon: '✨' },
    { value: 'blocks', label: 'Blocks & Structure', icon: '📝' },
    { value: 'editing', label: 'Editing & History', icon: '✏️' },
    { value: 'navigation', label: 'Navigation & Modes', icon: '🧭' },
    { value: 'tables', label: 'Tables', icon: '📊' },
  ];

  const formatShortcutKey = (key: string): string => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    return key
      .replace(/Mod/g, isMac ? '⌘' : 'Ctrl')
      .replace(/Alt/g, isMac ? '⌥' : 'Alt')
      .replace(/Shift/g, '⇧')
      .replace(/-/g, isMac ? '' : '+');
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'formatting': return '✨';
      case 'blocks': return '📝';
      case 'editing': return '✏️';
      case 'navigation': return '🧭';
      case 'tables': return '📊';
      default: return '⌨️';
    }
  };

  const getCategoryTitle = (category: string): string => {
    switch (category) {
      case 'formatting': return 'Text Formatting';
      case 'blocks': return 'Blocks & Structure';
      case 'editing': return 'Editing & History';
      case 'navigation': return 'Navigation';
      case 'tables': return 'Tables';
      default: return category;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </DialogTitle>
          <p id="keyboard-shortcuts-description" className="text-sm text-muted-foreground">
            Use these keyboard shortcuts to work more efficiently in the editor
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Search keyboard shortcuts"
              />
            </div>
            <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Shortcut categories">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="text-xs"
                  role="tab"
                  aria-selected={selectedCategory === category.value}
                  aria-controls="shortcuts-content"
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const currentIndex = categories.findIndex(c => c.value === category.value);
                      const nextIndex = e.key === 'ArrowRight' 
                        ? (currentIndex + 1) % categories.length
                        : (currentIndex - 1 + categories.length) % categories.length;
                      
                      const nextButton = document.querySelector(
                        `[role="tab"][aria-controls="shortcuts-content"]:nth-child(${nextIndex + 1})`
                      ) as HTMLElement;
                      nextButton?.focus();
                      setSelectedCategory(categories[nextIndex].value);
                    }
                  }}
                >
                  <span className="mr-1" aria-hidden="true">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Shortcuts List */}
          <div 
            id="shortcuts-content"
            className="flex-1 overflow-y-auto space-y-6 pr-2"
            role="tabpanel"
            aria-labelledby="keyboard-shortcuts-description"
          >
            {Object.keys(filteredShortcuts).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No shortcuts found matching your search.</p>
              </div>
            ) : (
              Object.entries(filteredShortcuts).map(([category, shortcuts]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" role="img" aria-label={getCategoryTitle(category)}>
                      {getCategoryIcon(category)}
                    </span>
                    <h3 className="font-semibold text-base">
                      {getCategoryTitle(category)}
                    </h3>
                  </div>
                  <div className="grid gap-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring"
                        tabIndex={0}
                        role="listitem"
                        aria-label={`${shortcut.description}, keyboard shortcut: ${formatShortcutKey(shortcut.key)}`}
                      >
                        <span className="text-sm text-foreground">
                          {shortcut.description}
                        </span>
                        <kbd 
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1",
                            "bg-background border border-border rounded text-xs font-mono",
                            "text-muted-foreground shadow-sm"
                          )}
                          aria-label={`Keyboard shortcut: ${formatShortcutKey(shortcut.key)}`}
                        >
                          {formatShortcutKey(shortcut.key)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                  {Object.keys(filteredShortcuts).indexOf(category) < Object.keys(filteredShortcuts).length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-muted border rounded text-xs">Cmd/Ctrl + /</kbd> to toggle this dialog
            </p>
            <Button onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
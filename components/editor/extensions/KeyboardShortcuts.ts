import { Extension } from '@tiptap/core';

export interface EditorKeyboardShortcut {
  key: string;
  description: string;
  category: 'formatting' | 'blocks' | 'navigation' | 'editing' | 'tables';
}

export const EDITOR_SHORTCUTS: EditorKeyboardShortcut[] = [
  // Text formatting
  { key: 'Mod-b', description: 'Toggle bold', category: 'formatting' },
  { key: 'Mod-i', description: 'Toggle italic', category: 'formatting' },
  { key: 'Mod-u', description: 'Toggle underline', category: 'formatting' },
  { key: 'Mod-Shift-x', description: 'Toggle strikethrough', category: 'formatting' },
  { key: 'Mod-e', description: 'Toggle inline code', category: 'formatting' },
  { key: 'Mod-\\', description: 'Clear formatting', category: 'formatting' },
  
  // Links and media
  { key: 'Mod-k', description: 'Insert/edit link', category: 'editing' },
  { key: 'Mod-Shift-k', description: 'Remove link', category: 'editing' },
  
  // History
  { key: 'Mod-z', description: 'Undo', category: 'editing' },
  { key: 'Mod-y', description: 'Redo', category: 'editing' },
  { key: 'Mod-Shift-z', description: 'Redo (alternative)', category: 'editing' },
  
  // Headings
  { key: 'Mod-Alt-1', description: 'Heading 1', category: 'blocks' },
  { key: 'Mod-Alt-2', description: 'Heading 2', category: 'blocks' },
  { key: 'Mod-Alt-3', description: 'Heading 3', category: 'blocks' },
  { key: 'Mod-Alt-0', description: 'Paragraph', category: 'blocks' },
  
  // Lists
  { key: 'Mod-Shift-7', description: 'Ordered list', category: 'blocks' },
  { key: 'Mod-Shift-8', description: 'Bullet list', category: 'blocks' },
  { key: 'Tab', description: 'Indent list item', category: 'blocks' },
  { key: 'Shift-Tab', description: 'Outdent list item', category: 'blocks' },
  
  // Blocks
  { key: 'Mod-Shift-9', description: 'Blockquote', category: 'blocks' },
  { key: 'Mod-Alt-c', description: 'Code block', category: 'blocks' },
  { key: 'Mod-Shift--', description: 'Horizontal rule', category: 'blocks' },
  
  // Navigation
  { key: 'Mod-a', description: 'Select all', category: 'navigation' },
  { key: 'Mod-f', description: 'Find in page', category: 'navigation' },
  { key: 'Escape', description: 'Close dialogs/menus', category: 'navigation' },
  { key: 'Mod-/', description: 'Show keyboard shortcuts', category: 'navigation' },
  { key: 'Alt-a', description: 'Open accessibility settings', category: 'navigation' },
  
  // Tables
  { key: 'Tab', description: 'Next table cell', category: 'tables' },
  { key: 'Shift-Tab', description: 'Previous table cell', category: 'tables' },
  { key: 'Mod-Shift-t', description: 'Insert table', category: 'tables' },
];

export const KeyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      // Text formatting shortcuts
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-u': () => this.editor.commands.toggleUnderline(),
      'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
      'Mod-e': () => this.editor.commands.toggleCode(),
      
      // Link shortcuts
      'Mod-k': () => {
        // Dispatch custom event to open link dialog
        const event = new CustomEvent('openLinkDialog');
        document.dispatchEvent(event);
        return true;
      },
      'Mod-Shift-k': () => {
        if (this.editor.isActive('link')) {
          this.editor.chain().focus().unsetLink().run();
        }
        return true;
      },

      // History shortcuts
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Mod-Shift-z': () => this.editor.commands.redo(),

      // List shortcuts
      'Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.sinkListItem('listItem');
        }
        if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
          return editor.commands.goToNextCell();
        }
        return false;
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.liftListItem('listItem');
        }
        if (editor.isActive('tableCell') || editor.isActive('tableHeader')) {
          return editor.commands.goToPreviousCell();
        }
        return false;
      },

      // Heading shortcuts
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),

      // Block shortcuts
      'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
      'Mod-Shift-9': () => this.editor.commands.toggleBlockquote(),
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      'Mod-Shift--': () => this.editor.commands.setHorizontalRule(),

      // Table shortcuts
      'Mod-Shift-t': () => {
        this.editor.commands.insertTable({ 
          rows: 3, 
          cols: 3, 
          withHeaderRow: true 
        });
        return true;
      },

      // Clear formatting
      'Mod-\\': () => this.editor.chain().focus().clearNodes().unsetAllMarks().run(),

      // Select all
      'Mod-a': () => {
        this.editor.commands.selectAll();
        return true;
      },

      // Help shortcut
      'Mod-/': () => {
        // Dispatch custom event to show help
        const event = new CustomEvent('showKeyboardHelp');
        document.dispatchEvent(event);
        return true;
      },

      // Accessibility settings shortcut
      'Alt-a': () => {
        // Dispatch custom event to show accessibility settings
        const event = new CustomEvent('showAccessibilitySettings');
        document.dispatchEvent(event);
        return true;
      },
    };
  },
});
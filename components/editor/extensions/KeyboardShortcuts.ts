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
  
  // Mode switching and view controls
  { key: 'F11', description: 'Toggle focus mode', category: 'navigation' },
  { key: 'Mod-Shift-f', description: 'Toggle fullscreen mode', category: 'navigation' },
  { key: 'Escape', description: 'Exit focus/fullscreen mode', category: 'navigation' },
  { key: 'Mod-Shift-d', description: 'Toggle distraction-free mode', category: 'navigation' },
  { key: 'Mod-Shift-t', description: 'Toggle contextual toolbar', category: 'navigation' },
  
  // Navigation and accessibility
  { key: 'Mod-a', description: 'Select all', category: 'navigation' },
  { key: 'Mod-f', description: 'Find in page', category: 'navigation' },
  { key: 'Mod-/', description: 'Show keyboard shortcuts', category: 'navigation' },
  { key: 'Alt-a', description: 'Open accessibility settings', category: 'navigation' },
  { key: 'Mod-\'', description: 'Focus editor', category: 'navigation' },
  { key: 'Alt-h', description: 'Show help dialog', category: 'navigation' },
  
  // Quick formatting shortcuts
  { key: 'Mod-1', description: 'Quick heading 1', category: 'formatting' },
  { key: 'Mod-2', description: 'Quick heading 2', category: 'formatting' },
  { key: 'Mod-3', description: 'Quick heading 3', category: 'formatting' },
  { key: 'Mod-0', description: 'Quick paragraph', category: 'formatting' },
  
  // Tables
  { key: 'Tab', description: 'Next table cell', category: 'tables' },
  { key: 'Shift-Tab', description: 'Previous table cell', category: 'tables' },
  { key: 'Mod-Shift-t', description: 'Insert table', category: 'tables' },
  { key: 'Mod-Shift-r', description: 'Add table row', category: 'tables' },
  { key: 'Mod-Shift-c', description: 'Add table column', category: 'tables' },
  { key: 'Mod-Shift-Delete', description: 'Delete table row/column', category: 'tables' },
  
  // Advanced editing
  { key: 'Mod-Shift-v', description: 'Paste without formatting', category: 'editing' },
  { key: 'Mod-d', description: 'Duplicate line/selection', category: 'editing' },
  { key: 'Mod-Shift-up', description: 'Move line up', category: 'editing' },
  { key: 'Mod-Shift-down', description: 'Move line down', category: 'editing' },
  { key: 'Mod-l', description: 'Select current line', category: 'editing' },
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

      // Heading shortcuts (both Alt and direct number shortcuts)
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
      
      // Quick heading shortcuts
      'Mod-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-0': () => this.editor.commands.setParagraph(),

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
      'Mod-Shift-r': () => {
        if (this.editor.isActive('table')) {
          this.editor.commands.addRowAfter();
          return true;
        }
        return false;
      },
      'Mod-Shift-c': () => {
        if (this.editor.isActive('table')) {
          this.editor.commands.addColumnAfter();
          return true;
        }
        return false;
      },
      'Mod-Shift-Delete': () => {
        if (this.editor.isActive('tableCell') || this.editor.isActive('tableHeader')) {
          // Try to delete row first, then column
          if (!this.editor.commands.deleteRow()) {
            this.editor.commands.deleteColumn();
          }
          return true;
        }
        return false;
      },

      // Advanced editing shortcuts
      'Mod-Shift-v': () => {
        // Paste without formatting - use browser's default paste
        document.execCommand('paste');
        return true;
      },
      'Mod-d': () => {
        // Duplicate current line or selection
        const { selection } = this.editor.state;
        const { from, to } = selection;
        const text = this.editor.state.doc.textBetween(from, to);
        
        if (text) {
          // Duplicate selection
          this.editor.commands.insertContentAt(to, text);
        } else {
          // Duplicate current line
          const line = this.editor.state.doc.resolve(from).parent;
          this.editor.commands.insertContentAt(to, line.textContent);
        }
        return true;
      },
      'Mod-l': () => {
        // Select current line
        const { selection } = this.editor.state;
        const { $from } = selection;
        const start = $from.start($from.depth);
        const end = $from.end($from.depth);
        this.editor.commands.setTextSelection({ from: start, to: end });
        return true;
      },

      // Clear formatting
      'Mod-\\': () => this.editor.chain().focus().clearNodes().unsetAllMarks().run(),

      // Select all
      'Mod-a': () => {
        this.editor.commands.selectAll();
        return true;
      },

      // Focus editor
      'Mod-\'': () => {
        this.editor.commands.focus();
        return true;
      },

      // Help and accessibility shortcuts
      'Mod-/': () => {
        // Dispatch custom event to show help
        const event = new CustomEvent('showKeyboardHelp');
        document.dispatchEvent(event);
        return true;
      },
      'Alt-h': () => {
        // Dispatch custom event to show help
        const event = new CustomEvent('showKeyboardHelp');
        document.dispatchEvent(event);
        return true;
      },
      'Alt-a': () => {
        // Dispatch custom event to show accessibility settings
        const event = new CustomEvent('showAccessibilitySettings');
        document.dispatchEvent(event);
        return true;
      },
    };
  },
});
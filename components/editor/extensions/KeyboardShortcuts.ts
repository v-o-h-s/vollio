import { Extension } from '@tiptap/core';

export const KeyboardShortcuts = Extension.create({
  name: 'keyboardShortcuts',

  addKeyboardShortcuts() {
    return {
      // Text formatting shortcuts
      'Mod-b': () => this.editor.commands.toggleBold(),
      'Mod-i': () => this.editor.commands.toggleItalic(),
      'Mod-u': () => this.editor.commands.toggleUnderline(),
      'Mod-Shift-x': () => this.editor.commands.toggleStrike(),
      
      // Link shortcut
      'Mod-k': () => {
        const previousUrl = this.editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
          return false;
        }

        // empty
        if (url === '') {
          this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
          return true;
        }

        // update link
        this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
        return false;
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.commands.liftListItem('listItem');
        }
        return false;
      },

      // Heading shortcuts
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),

      // Block shortcuts
      'Mod-Shift-7': () => this.editor.commands.toggleOrderedList(),
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
      'Mod-Shift-9': () => this.editor.commands.toggleBlockquote(),
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),

      // Clear formatting
      'Mod-\\': () => this.editor.chain().focus().clearNodes().unsetAllMarks().run(),
    };
  },
});
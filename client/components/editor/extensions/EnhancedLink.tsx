'use client';

import { Link } from '@tiptap/extension-link';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Mark, mergeAttributes } from '@tiptap/core';

// URL detection regex
const URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;

export interface EnhancedLinkOptions {
  openOnClick: boolean;
  linkOnPaste: boolean;
  autolink: boolean;
  protocols: string[];
  HTMLAttributes: Record<string, any>;
  validate?: (url: string) => boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enhancedLink: {
      /**
       * Set a link mark
       */
      setLink: (attributes: { href: string; target?: string }) => ReturnType;
      /**
       * Toggle a link mark
       */
      toggleLink: (attributes: { href: string; target?: string }) => ReturnType;
      /**
       * Unset a link mark
       */
      unsetLink: () => ReturnType;
    };
  }
}

export const EnhancedLink = Link.extend<EnhancedLinkOptions>({
  name: 'enhancedLink',

  addOptions() {
    return {
      ...this.parent?.(),
      openOnClick: false,
      linkOnPaste: true,
      autolink: true,
      protocols: ['http', 'https', 'ftp', 'ftps', 'mailto'],
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        class: 'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer',
      },
      validate: (url: string) => !!url,
    };
  },

  addProseMirrorPlugins() {
    const plugins = this.parent?.() || [];

    if (this.options.autolink) {
      plugins.push(
        new Plugin({
          key: new PluginKey('autolink'),
          appendTransaction: (transactions, oldState, newState) => {
            const docChanges = transactions.some(transaction => transaction.docChanged) && !oldState.doc.eq(newState.doc);
            
            if (!docChanges) {
              return null;
            }

            const { tr } = newState;
            const transform = tr;
            let modified = false;

            // Find text nodes and check for URLs
            newState.doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                const text = node.text;
                let match;
                
                // Reset regex
                URL_REGEX.lastIndex = 0;
                
                while ((match = URL_REGEX.exec(text)) !== null) {
                  const url = match[0];
                  const start = pos + match.index;
                  const end = start + url.length;

                  // Check if this position already has a link mark
                  const hasLinkMark = newState.doc.rangeHasMark(start, end, this.type);
                  
                  if (!hasLinkMark && this.options.validate?.(url)) {
                    const linkMark = this.type.create({ href: url });
                    transform.addMark(start, end, linkMark);
                    modified = true;
                  }
                }
              }
            });

            return modified ? transform : null;
          },
        })
      );
    }

    if (this.options.linkOnPaste) {
      plugins.push(
        new Plugin({
          key: new PluginKey('linkOnPaste'),
          props: {
            handlePaste: (view, event, slice) => {
              const { state } = view;
              const { selection } = state;
              const { empty } = selection;

              if (empty) {
                return false;
              }

              let textContent = '';
              slice.content.forEach(node => {
                if (node.isText) {
                  textContent += node.text;
                }
              });

              const url = textContent.trim();

              // Check if the pasted content is a URL
              if (this.options.validate?.(url) && URL_REGEX.test(url)) {
                // If text is selected, make it a link
                const linkMark = this.type.create({ href: url });
                const tr = state.tr.addMark(selection.from, selection.to, linkMark);
                view.dispatch(tr);
                return true;
              }

              return false;
            },
          },
        })
      );
    }

    return plugins;
  },

  renderHTML({ HTMLAttributes }) {
    // Don't render invalid links
    if (!HTMLAttributes.href) {
      return ['span', {}, 0];
    }

    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setLink:
        (attributes) =>
        ({ chain }) => {
          return chain()
            .setMark(this.name, attributes)
            .setMeta('preventAutolink', true)
            .run();
        },

      toggleLink:
        (attributes) =>
        ({ chain }) => {
          return chain()
            .toggleMark(this.name, attributes, { extendEmptyMarkRange: true })
            .setMeta('preventAutolink', true)
            .run();
        },

      unsetLink:
        () =>
        ({ chain }) => {
          return chain()
            .unsetMark(this.name, { extendEmptyMarkRange: true })
            .setMeta('preventAutolink', true)
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => {
        // This will be handled by the editor component to open the link dialog
        const event = new CustomEvent('openLinkDialog');
        document.dispatchEvent(event);
        return true;
      },
    };
  },
});
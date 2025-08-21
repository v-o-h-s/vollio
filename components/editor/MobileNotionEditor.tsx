'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { History } from '@tiptap/extension-history';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Heading } from '@tiptap/extension-heading';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';

import { SlashCommand, slashCommandSuggestion } from './extensions/SlashCommand';
import { KeyboardShortcuts } from './extensions/KeyboardShortcuts';
import { ImageUpload } from './extensions/ImageUpload';
import { EnhancedLink } from './extensions/EnhancedLink';
import { LinkDialog } from './LinkDialog';
import { BubbleMenu } from './BubbleMenu';
import { TableBubbleMenu } from './TableBubbleMenu';
import { MobileEditorToolbar } from './MobileEditorToolbar';
import { MobileTextSelection } from './MobileTextSelection';
import { MobileContextMenu } from './MobileContextMenu';
import { MobileDragDrop } from './MobileDragDrop';
import { MobileSlashCommand } from './MobileSlashCommand';
import { MobileFormattingPanel } from './MobileFormattingPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileKeyboard } from '@/hooks/use-mobile-keyboard';
import { cn } from '@/lib/utils';
import type { NotionEditorProps } from './types';

export function MobileNotionEditor({
  content,
  onChange,
  onUpdate,
  placeholder = 'Start writing...',
  editable = true,
  className,
  autoFocus = false,
  customToolbar,
}: NotionEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isMobileToolbarVisible, setIsMobileToolbarVisible] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [slashCommandVisible, setSlashCommandVisible] = useState(false);
  const [slashCommandPosition, setSlashCommandPosition] = useState({ x: 0, y: 0 });
  const [formattingPanelVisible, setFormattingPanelVisible] = useState(false);
  const isMobile = useIsMobile();
  const { keyboardHeight, isKeyboardVisible } = useMobileKeyboard({
    adjustViewport: true,
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      History.configure({
        depth: 100,
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: 'text-base leading-relaxed mb-2',
        },
      }),
      Text,
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'font-semibold tracking-tight scroll-mt-20 mb-3',
        },
      }),
      Bold.configure({
        HTMLAttributes: {
          class: 'font-semibold',
        },
      }),
      Italic.configure({
        HTMLAttributes: {
          class: 'italic',
        },
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
      Strike.configure({
        HTMLAttributes: {
          class: 'line-through',
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'my-2 pl-4',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'my-2 pl-4',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'leading-relaxed mb-1',
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto my-4',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground my-4',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-muted-foreground/20 my-6',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-muted my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-muted',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-muted bg-muted/50 px-3 py-2 text-left font-medium',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-muted px-3 py-2',
        },
      }),
      EnhancedLink.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
        validate: (url: string) => {
          try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return true;
          } catch {
            return false;
          }
        },
      }),
      ImageUpload.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      SlashCommand.configure({
        suggestion: slashCommandSuggestion,
      }),
      KeyboardShortcuts,
    ],
    content: content || '',
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none',
          'focus:outline-none',
          // Mobile-optimized spacing and sizing
          isMobile ? 'min-h-[300px] p-4 pb-20' : 'min-h-[200px] p-4',
          // Touch-friendly line height and spacing
          isMobile && 'leading-relaxed',
          className
        ),
        'data-placeholder': placeholder,
      },
      // Mobile-specific editor props
      handleDOMEvents: isMobile ? {
        // Handle touch events for mobile
        touchstart: (view, event) => {
          // Show mobile toolbar on touch
          if (!isMobileToolbarVisible) {
            setIsMobileToolbarVisible(true);
          }
          return false;
        },
        // Handle key events for slash command
        keydown: (view, event) => {
          if (event.key === '/') {
            const { selection } = view.state;
            const coords = view.coordsAtPos(selection.from);
            setSlashCommandPosition({ x: coords.left, y: coords.bottom + 10 });
            setTimeout(() => setSlashCommandVisible(true), 100);
          }
          return false;
        },
        // Handle selection changes
        selectionchange: (view) => {
          const { selection } = view.state;
          const hasTextSelection = !selection.empty;
          setHasSelection(hasTextSelection);
          
          // Show mobile toolbar when there's a selection
          if (hasTextSelection && !isMobileToolbarVisible) {
            setIsMobileToolbarVisible(true);
          }
          return false;
        },
      } : {},
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json as any);
      onUpdate?.(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      const hasTextSelection = !selection.empty;
      setHasSelection(hasTextSelection);
    },
  });

  // Handle content updates when prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [editor, content]);

  // Handle editable state changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Handle link dialog keyboard shortcut
  useEffect(() => {
    const handleOpenLinkDialog = () => {
      if (editor && !editor.isDestroyed) {
        setIsLinkDialogOpen(true);
      }
    };

    document.addEventListener('openLinkDialog', handleOpenLinkDialog);
    
    return () => {
      document.removeEventListener('openLinkDialog', handleOpenLinkDialog);
    };
  }, [editor]);

  // Handle viewport adjustments for mobile keyboard
  useEffect(() => {
    if (!isMobile) return;

    const handleViewportChange = () => {
      // Adjust editor height when virtual keyboard appears
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      
      if (viewportHeight < windowHeight * 0.75) {
        // Virtual keyboard is likely open
        document.documentElement.style.setProperty('--keyboard-height', `${windowHeight - viewportHeight}px`);
      } else {
        document.documentElement.style.removeProperty('--keyboard-height');
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    }
  }, [isMobile]);

  // Auto-hide mobile toolbar after inactivity
  useEffect(() => {
    if (!isMobile || !isMobileToolbarVisible) return;

    const timer = setTimeout(() => {
      if (!hasSelection) {
        setIsMobileToolbarVisible(false);
      }
    }, 5000); // Hide after 5 seconds of inactivity

    return () => clearTimeout(timer);
  }, [isMobile, isMobileToolbarVisible, hasSelection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className="w-full relative">
      {editor && (
        <>
          {/* Desktop toolbars */}
          {!isMobile && (
            <>
              <BubbleMenu editor={editor} />
              <TableBubbleMenu editor={editor} />
              {customToolbar ? customToolbar(editor) : null}
            </>
          )}
          
          {/* Mobile components */}
          {isMobile && (
            <>
              <MobileEditorToolbar
                editor={editor}
                isVisible={isMobileToolbarVisible}
                onClose={() => setIsMobileToolbarVisible(false)}
              />
              <MobileTextSelection
                editor={editor}
                onSelectionChange={(hasSelection) => {
                  setHasSelection(hasSelection);
                  if (hasSelection && !isMobileToolbarVisible) {
                    setIsMobileToolbarVisible(true);
                  }
                }}
              />
              <MobileContextMenu
                editor={editor}
                isVisible={contextMenuVisible}
                position={contextMenuPosition}
                onClose={() => setContextMenuVisible(false)}
              />
              <MobileSlashCommand
                editor={editor}
                isVisible={slashCommandVisible}
                position={slashCommandPosition}
                onClose={() => setSlashCommandVisible(false)}
              />
              <MobileFormattingPanel
                editor={editor}
                isVisible={formattingPanelVisible}
                onClose={() => setFormattingPanelVisible(false)}
              />
              <MobileDragDrop editor={editor} />
            </>
          )}
        </>
      )}
      
      <EditorContent 
        editor={editor} 
        className={cn(
          'w-full rounded-md border border-input bg-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          'transition-all duration-200',
          // Mobile-specific styles
          isMobile && [
            'touch-manipulation', // Optimize for touch
            'text-base', // Prevent zoom on iOS
            'min-h-[50vh]', // Ensure adequate height on mobile
          ]
        )}
        // Add mobile-specific touch handling
        onTouchStart={isMobile ? () => {
          if (!isMobileToolbarVisible) {
            setIsMobileToolbarVisible(true);
          }
        } : undefined}
      />
      
      {editor && (
        <LinkDialog
          editor={editor}
          isOpen={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
        />
      )}
      
      {/* Mobile keyboard spacer */}
      {isMobile && (
        <div 
          className="transition-all duration-300"
          style={{ height: 'var(--keyboard-height, 0px)' }}
        />
      )}
    </div>
  );
}
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
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
import { CodeBlock } from '@tiptap/extension-code-block';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Link } from '@tiptap/extension-link';
import { EditorToolbar } from './EditorToolbar';
import { cn } from '@/lib/utils';
import type { NotionEditorProps } from './types';

export function NotionEditorWithToolbar({
  content,
  onChange,
  onUpdate,
  placeholder = 'Start writing...',
  editable = true,
  className,
  autoFocus = false,
}: NotionEditorProps) {
  const editor = useEditor({
    extensions: [
      Document,
      History.configure({
        depth: 100,
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: 'text-base leading-relaxed',
        },
      }),
      Text,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: 'font-semibold tracking-tight',
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
          class: 'list-disc list-inside space-y-1',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-inside space-y-1',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'leading-relaxed',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-muted-foreground/20 my-6',
        },
      }),
      Link.configure({
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors',
        },
        openOnClick: false,
      }),
    ],
    content: content || '',
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none',
          'focus:outline-none',
          'min-h-[300px] p-4',
          '[&_.ProseMirror]:outline-none',
          '[&_.ProseMirror]:min-h-[300px]',
          '[&_.ProseMirror]:p-4'
        ),
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json as any);
      onUpdate?.(editor);
    },
  });

  return (
    <div className={cn('w-full border border-input rounded-md bg-background', className)}>
      <EditorToolbar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="w-full"
      />
    </div>
  );
}
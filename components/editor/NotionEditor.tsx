"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { History } from "@tiptap/extension-history";
import TextAlign from "@tiptap/extension-text-align";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Heading } from "@tiptap/extension-heading";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Underline } from "@tiptap/extension-underline";
import { Strike } from "@tiptap/extension-strike";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { Code } from "@tiptap/extension-code";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Blockquote } from "@tiptap/extension-blockquote";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

import {
  SlashCommand,
  slashCommandSuggestion,
} from "./extensions/SlashCommand";
import { KeyboardShortcuts } from "./extensions/KeyboardShortcuts";
import { ImageUpload } from "./extensions/ImageUpload";
import { EnhancedLink } from "./extensions/EnhancedLink";
import { LinkDialog } from "./LinkDialog";
import { BubbleMenu } from "./BubbleMenu";
import { TableBubbleMenu } from "./TableBubbleMenu";
import { FloatingToolbar } from "./FloatingToolbar";

import { useEditorKeyboardShortcuts } from "@/hooks/use-editor-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { AutoSaveStatus } from "./AutoSaveStatus";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useCreateNoteMutation, useUpdateNoteMutation } from "@/lib/store/apiSlice";
import type { NotionEditorProps } from "./types";

function NotionEditorInner({
  content,
  onChange,
  onUpdate,
  placeholder = "Start writing...",
  editable = true,
  className,
  autoFocus = false,
  customToolbar,
  showWordCount = false,
  showReadingTime = false,
  // Auto-save props
  autoSave = false,
  noteId,
  autoSaveDelay = 500,
  onAutoSaveStatusChange,
}: NotionEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  // Responsive design handled via CSS

  // Auto-save functionality
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(noteId);

  // RTK Query mutations for note operations
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  // Update currentNoteId when noteId prop changes
  useEffect(() => {
    if (noteId) {
      setCurrentNoteId(noteId);
    }
  }, [noteId]);

  // Helper function to extract title from editor content
  const extractTitleFromContent = useCallback((content: any): string => {
    if (!content || !content.content) return "Untitled Note";

    const firstNode = content.content[0];
    if (firstNode && firstNode.type === "heading" && firstNode.content) {
      return firstNode.content.map((c: any) => c.text || "").join("");
    }

    if (firstNode && firstNode.type === "paragraph" && firstNode.content) {
      const text = firstNode.content.map((c: any) => c.text || "").join("");
      return text.length > 50 ? text.substring(0, 50) + "..." : text || "Untitled Note";
    }

    return "Untitled Note";
  }, []);

  // Internal auto-save handler
  const handleAutoSave = useCallback(
    async (content: any) => {
      const title = extractTitleFromContent(content);

      if (!currentNoteId) {
        // Create new note using RTK Query
        const newNote = await createNote({ title, content }).unwrap();
        const newNoteId = newNote.id;
        
        setCurrentNoteId(newNoteId);
      } else {
        // Update existing note using RTK Query
        await updateNote({ 
          id: currentNoteId, 
          updates: { title, content } 
        }).unwrap();
      }
    },
    [currentNoteId, extractTitleFromContent, createNote, updateNote]
  );

  const {
    status: autoSaveStatus,
    lastSaved,
    error: autoSaveError,
    updateContent,
  } = useAutoSave({
    onSave: handleAutoSave,
    delay: autoSaveDelay,
    enabled: autoSave && editable,
  });

  // Notify parent of auto-save status changes
  useEffect(() => {
    if (onAutoSaveStatusChange) {
      onAutoSaveStatusChange({
        status: autoSaveStatus,
        lastSaved,
        error: autoSaveError,
      });
    }
  }, [autoSaveStatus, lastSaved, autoSaveError, onAutoSaveStatusChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      History.configure({
        depth: 100,
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: "text-base leading-relaxed",
        },
      }),
      Text,
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "font-semibold tracking-tight scroll-mt-20",
        },
      }),
      Bold.configure({
        HTMLAttributes: {
          class: "font-semibold",
        },
      }),
      Italic.configure({
        HTMLAttributes: {
          class: "italic",
        },
      }),
      Underline.configure({
        HTMLAttributes: {
          class: "underline",
        },
      }),
      Strike.configure({
        HTMLAttributes: {
          class: "line-through",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "my-2",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "my-2",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "leading-relaxed",
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: "bg-muted px-1.5 py-0.5 rounded text-sm font-mono",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class:
            "border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "border-muted-foreground/20 my-6",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full border border-muted",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-muted",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-muted bg-muted/50 px-4 py-2 text-left font-medium",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-muted px-4 py-2",
        },
      }),
      EnhancedLink.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        },
        validate: (url: string) => {
          // Basic URL validation
          try {
            new URL(url.startsWith("http") ? url : `https://${url}`);
            return true;
          } catch {
            return false;
          }
        },
      }),
      // Add image upload functionality
      ImageUpload.configure({
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
      // Add slash command functionality
      SlashCommand.configure({
        suggestion: slashCommandSuggestion,
      }),
      // Add keyboard shortcuts
      KeyboardShortcuts,
      // Add text alignment
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || "",
    editable,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none",
          "focus:outline-none",
          "min-h-[200px] p-4",
          "responsive-editor",
          className
        ),
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json as any);
      onUpdate?.(editor);

      // Trigger auto-save if enabled
      if (autoSave && editable) {
        updateContent(json);
      }
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

  // Calculate word count and reading time
  const stats = useMemo(() => {
    if (!editor) return { wordCount: 0, readingTime: 0 };

    const text = editor.getText();
    const wordCount = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

    return { wordCount, readingTime };
  }, [editor, content]);

  // Set up keyboard shortcuts
  useEditorKeyboardShortcuts({
    editor,
    enabled: editable,
    onOpenLinkDialog: () => setIsLinkDialogOpen(true),
  });

  // Handle dialog keyboard shortcuts
  useEffect(() => {
    const handleOpenLinkDialog = () => {
      if (editor && !editor.isDestroyed) {
        setIsLinkDialogOpen(true);
      }
    };

    document.addEventListener("openLinkDialog", handleOpenLinkDialog);

    return () => {
      document.removeEventListener("openLinkDialog", handleOpenLinkDialog);
    };
  }, [editor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className="w-full">
      {editor && (
        <>
          <BubbleMenu editor={editor} />
          <TableBubbleMenu editor={editor} />
          {customToolbar ? (
            customToolbar(editor)
          ) : (
            <FloatingToolbar editor={editor} />
          )}
        </>
      )}
      <EditorContent
        id="editor-content"
        editor={editor}
        className={cn(
          "w-full rounded-md border border-input bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "transition-all duration-200"
        )}
      />

      {/* Auto-save Status */}
      {autoSave && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
          <AutoSaveStatus
            status={autoSaveStatus}
            lastSaved={lastSaved}
            error={autoSaveError}
          />
          {(showWordCount || showReadingTime) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {showWordCount && <span>{stats.wordCount} words</span>}
              {showReadingTime && <span>{stats.readingTime} min read</span>}
            </div>
          )}
        </div>
      )}

      {editor && (
        <LinkDialog
          editor={editor}
          isOpen={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
        />
      )}
    </div>
  );
}

export function NotionEditor(props: NotionEditorProps) {
  return <NotionEditorInner {...props} />;
}

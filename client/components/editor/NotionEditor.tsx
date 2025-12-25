"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
import { cn } from "@/lib/utils";
import { AutoSaveStatus } from "./AutoSaveStatus";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useAutoSaveStatus } from "@/components/dashboard/AutoSaveStatusProvider";
import {
  useCreateNoteMutation,
  useUpdateNoteMutation,
} from "@/lib/store/apiSlice";
import type { NotionEditorProps } from "@/lib/types/editor";
import type { JSONContent } from "@tiptap/react";
import type { NoteContent } from "@/lib/types/editor";

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
  onNoteCreated,
  fileId,
}: NotionEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState(content?.title || "");

  // Auto-save functionality
  const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(
    noteId
  );

  // RTK Query mutations for note operations
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  // Update title when content prop changes (only on initial load)
  const hasInitialized = useRef(false);
  const hasContentInitialized = useRef(false);

  useEffect(() => {
    // Only update title from props on initial load, not during user editing
    if (content?.title !== undefined && !hasInitialized.current) {
      console.log("🔄 Initial load, setting title from props:", content.title);
      setNoteTitle(content.title);
      hasInitialized.current = true;
    }
  }, [content?.title]);

  // Internal auto-save handler
  const handleAutoSave = useCallback(
    async (noteContent: NoteContent) => {
      // Use the title from noteContent first, then fallback to current noteTitle state
      // Only use "Untitled Note" if both are truly empty
      const title =
        noteContent.title?.trim() || noteTitle.trim() || "Untitled Note";
      const content = noteContent.content;

      console.log("🔄 Auto-save triggered:", {
        noteContentTitle: noteContent.title,
        noteTitleState: noteTitle,
        finalTitle: title,
        currentNoteId,
        hasContent: !!content,
      });

      // For new notes, we need content
      if (!currentNoteId && !content) {
        console.warn("Auto-save: Cannot create new note without content");
        return;
      }

      if (!currentNoteId) {
        // Create new note using RTK Query
        console.log(
          "📝 Creating new note with title:",
          title,
          "fileId:",
          fileId
        );

        const newNote = await createNote({
          title,
          content,
          pdfId: fileId,
        }).unwrap();
        const newNoteId = newNote.id;

        setCurrentNoteId(newNoteId);

        // Call the onNoteCreated callback only once when note is first created
        if (onNoteCreated) {
          onNoteCreated(newNoteId);
        }
      } else {
        // Update existing note using RTK Query
        console.log("💾 Updating existing note with title:", title);

        // Build updates object - only include fields that are provided
        const updates: { title?: string; content?: JSONContent } = {};
        if (title) updates.title = title;
        if (content) updates.content = content;

        await updateNote({
          id: currentNoteId,
          updates,
        }).unwrap();
      }
    },
    [currentNoteId, noteTitle, createNote, updateNote, onNoteCreated]
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

  // Global auto-save status context
  const { updateStatus: updateGlobalAutoSaveStatus } = useAutoSaveStatus();

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

  // Update global auto-save status context
  useEffect(() => {
    updateGlobalAutoSaveStatus(
      autoSaveStatus,
      lastSaved,
      autoSaveError,
      !currentNoteId // isCreating is true when we don't have a noteId yet
    );
  }, [
    autoSaveStatus,
    lastSaved,
    autoSaveError,
    currentNoteId,
    updateGlobalAutoSaveStatus,
  ]);

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
    content: content?.content || "",
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
        updateContent({ title: noteTitle, content: json });
      }
    },
  });

  // will back to this shit soon lol

  // Handle title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      console.log("📝 Title changed:", { oldTitle: noteTitle, newTitle });
      setNoteTitle(newTitle);

      // Trigger auto-save when title changes (will debounce in useEffect below)
      // The debounce effect will handle the actual saving
    },
    [noteTitle]
  );

  // Focus title input for new notes
  useEffect(() => {
    if (autoFocus && !noteId && !content?.title) {
      // Focus the title input for new notes
      const titleInput = document.querySelector(
        'input[placeholder="Enter note title..."]'
      ) as HTMLInputElement;
      if (titleInput) {
        setTimeout(() => titleInput.focus(), 100);
      }
    }
  }, [autoFocus, noteId, content?.title]);

  // Save title changes with debounce (500ms) to avoid excessive requests
  useEffect(() => {
    if (!currentNoteId || !autoSave) return;

    const timer = setTimeout(() => {
      if (noteTitle && noteTitle !== content?.title) {
        console.log("💾 Saving title change to database:", noteTitle);
        // Use updateContent to trigger auto-save through the hook for proper status tracking
        updateContent({ title: noteTitle, content: editor?.getJSON() });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    noteTitle,
    currentNoteId,
    editor,
    updateContent,
    content?.title,
    autoSave,
  ]);
  // Handle content updates when prop changes (only on initial load or when switching notes)
  useEffect(() => {
    if (editor && content?.content !== undefined) {
      // Only set content on initial load or when switching to a different note
      // This prevents cache updates from overwriting current edits during auto-save
      if (!hasContentInitialized.current) {
        console.log("🔄 Initial content load", { noteId: currentNoteId });
        editor.commands.setContent(content.content, { emitUpdate: false });
        hasContentInitialized.current = true;
      }
    }
  }, [editor, content?.content, currentNoteId]);

  // Reset content initialization when switching notes
  useEffect(() => {
    hasContentInitialized.current = false;
    hasInitialized.current = false;
  }, [noteId]);

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
  }, [editor, content?.content]);

  // Handle dialog keyboard shortcuts and custom events
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
      {/* Title Section */}
      <div className="mb-4 bg-background">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter note title..."
          disabled={!editable}
          className={cn(
            "w-full px-4 py-3 text-xl font-semibold bg-transparent border-0",
            "focus:outline-none focus:ring-0 placeholder:text-muted-foreground",
            "resize-none overflow-hidden"
          )}
          style={{ fontSize: "1.5rem", lineHeight: "2rem" }}
        />
        <hr className="border-border" />
      </div>

      {/* Content Section */}
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
          "w-full bg-background",
          "focus-within:outline-none",
          "transition-all duration-200"
        )}
      />

      {editor && (
        <LinkDialog
          editor={editor}
          isOpen={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
        />
      )}

      {/* AutoSaveStatus - Shows in bottom-right when autoSave is enabled */}
      {autoSave && (
        <div className="absolute bottom-2 right-2 z-10">
          <AutoSaveStatus
            status={autoSaveStatus}
            lastSaved={lastSaved}
            error={autoSaveError}
            isCreating={!currentNoteId}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}

export function NotionEditor(props: NotionEditorProps) {
  return <NotionEditorInner {...props} />;
}

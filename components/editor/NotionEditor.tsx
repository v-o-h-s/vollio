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
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import {
  AccessibilityProvider,
  useAccessibility,
} from "./AccessibilityProvider";
import { AccessibilitySettingsDialog } from "./AccessibilitySettingsDialog";
import {
  useEditorKeyboardShortcuts,
  useEditorAccessibility,
} from "@/hooks/use-editor-keyboard-shortcuts";
import {
  useMobileEditor,
  useMobileEditorEnhancements,
} from "@/hooks/use-mobile-editor";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  MultiModeEditor,
  useEditorMode,
  type EditorMode,
} from "./MultiModeEditor";
import { AdaptiveFloatingToolbar } from "./AdaptiveFloatingToolbar";
import { ContextualToolbar } from "./ContextualToolbar";
import { EditorStatsDisplay } from "./EditorStatsDisplay";
import { TypographySettings } from "./TypographySettings";
import { AutoSaveStatus } from "./AutoSaveStatus";
import { useAutoSave } from "@/hooks/use-auto-save";
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
  mode: initialMode = "normal",
  onModeChange,
  showModeToggle = false,
  showWordCount = false,
  showReadingTime = false,
  showContextualToolbar: showContextualToolbarProp = true,
  distractionFreeMode: distractionFreeModeProp = false,
  enhancedTypography = true,
  // Auto-save props
  autoSave = false,
  noteId,
  onAutoSave,
  autoSaveDelay = 500,
}: NotionEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isAccessibilitySettingsOpen, setIsAccessibilitySettingsOpen] =
    useState(false);
  const [showContextualToolbar, setShowContextualToolbar] = useState(
    showContextualToolbarProp
  );
  const [distractionFreeMode, setDistractionFreeMode] = useState(
    distractionFreeModeProp
  );
  const { settings } = useAccessibility();

  // Mobile detection and enhancements
  const isMobile = useIsMobile();
  useMobileEditorEnhancements();

  // Multi-mode editor state
  const { mode, setMode } = useEditorMode(initialMode);

  // Auto-save functionality
  const handleAutoSave = useCallback(async (content: any) => {
    if (!noteId) {
      throw new Error("Note ID is required for auto-save");
    }

    if (onAutoSave) {
      await onAutoSave(content, noteId);
    } else {
      // Default auto-save implementation
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save note");
      }
    }
  }, [noteId, onAutoSave]);

  const {
    status: autoSaveStatus,
    lastSaved,
    error: autoSaveError,
    updateContent,
  } = useAutoSave({
    onSave: handleAutoSave,
    delay: autoSaveDelay,
    enabled: autoSave && editable && !!noteId,
  });

  // Mobile editor management
  const {
    containerRef,
    handleInputFocus,
    handleInputBlur,
    preventZoom,
    isKeyboardVisible,
    keyboardHeight,
    viewportHeight,
    isGestureActive,
    hapticFeedback,
  } = useMobileEditor({
    enableGestures: isMobile,
    enableHapticFeedback: isMobile,
    enableKeyboardAdjustments: isMobile,
    onModeChange: (newMode) => {
      setMode(newMode);
      onModeChange?.(newMode);
    },
    onSwipeLeft: () => {
      // Could implement navigation between notes
      console.log("Swipe left detected");
    },
    onSwipeRight: () => {
      // Could implement navigation between notes
      console.log("Swipe right detected");
    },
  });

  // Handle mode changes
  const handleModeChange = useCallback(
    (newMode: EditorMode) => {
      setMode(newMode);
      onModeChange?.(newMode);

      // Mobile haptic feedback
      if (isMobile) {
        hapticFeedback.success();
      }
    },
    [setMode, onModeChange, isMobile]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      History.configure({
        depth: 100,
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: cn(
            "text-base leading-relaxed",
            isMobile && "mobile-paragraph"
          ),
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
          `editor-${mode}`,
          enhancedTypography && "editor-typography-optimized",
          settings.highContrast && "high-contrast-editor",
          settings.screenReaderOptimized && "screen-reader-optimized",
          distractionFreeMode && "editor-distraction-free",
          isMobile && "mobile-editor",
          isMobile && isKeyboardVisible && "mobile-keyboard-visible",
          isMobile && isGestureActive && "mobile-gesture-active",
          className
        ),
        "data-placeholder": placeholder,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Rich text editor",
        "aria-describedby": "editor-keyboard-help editor-accessibility-info",
        ...(isMobile && {
          "data-mobile": "true",
          "data-keyboard-height": keyboardHeight.toString(),
          "data-viewport-height": viewportHeight.toString(),
        }),
      },
      handleDOMEvents: {
        ...(isMobile && {
          focus: (view, event) => {
            const target = event.target as HTMLElement;
            handleInputFocus(target);
            preventZoom();
            return false;
          },
          blur: (view, event) => {
            const target = event.target as HTMLElement;
            handleInputBlur(target);
            return false;
          },
        }),
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

  // Set up keyboard shortcuts and accessibility
  const { isHelpOpen, setIsHelpOpen } = useEditorKeyboardShortcuts({
    editor,
    enabled: editable,
    onOpenLinkDialog: () => setIsLinkDialogOpen(true),
  });

  // Move this BEFORE the useEffect that uses announceToScreenReader
  const { announceToScreenReader } = useEditorAccessibility(editor);

  // Enhanced keyboard shortcuts for mode switching and features with accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 for focus mode
      if (event.key === "F11") {
        event.preventDefault();
        const newMode = mode === "focus" ? "normal" : "focus";
        handleModeChange(newMode);
        announceToScreenReader(`Switched to ${newMode} mode`);
      }

      // Escape to exit focus mode
      if (event.key === "Escape" && mode === "focus") {
        event.preventDefault();
        handleModeChange("normal");
        announceToScreenReader("Exited focus mode");
      }

      // Ctrl/Cmd + Shift + F for fullscreen
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "F"
      ) {
        event.preventDefault();
        const newMode = mode === "fullscreen" ? "normal" : "fullscreen";
        handleModeChange(newMode);
        announceToScreenReader(`Switched to ${newMode} mode`);
      }

      // Ctrl/Cmd + Shift + D for distraction-free mode
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "D"
      ) {
        event.preventDefault();
        setDistractionFreeMode((prev) => {
          const newValue = !prev;
          announceToScreenReader(
            `Distraction-free mode ${newValue ? "enabled" : "disabled"}`
          );
          return newValue;
        });
      }

      // Ctrl/Cmd + Shift + T for contextual toolbar toggle
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "T"
      ) {
        event.preventDefault();
        setShowContextualToolbar((prev) => {
          const newValue = !prev;
          announceToScreenReader(
            `Contextual toolbar ${newValue ? "shown" : "hidden"}`
          );
          return newValue;
        });
      }

      // Alt + A for accessibility settings
      if (event.altKey && event.key === "a") {
        event.preventDefault();
        setIsAccessibilitySettingsOpen(true);
        announceToScreenReader("Accessibility settings opened");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mode, handleModeChange, announceToScreenReader]);

  // Handle dialog keyboard shortcuts
  useEffect(() => {
    const handleOpenLinkDialog = () => {
      if (editor && !editor.isDestroyed) {
        setIsLinkDialogOpen(true);
        announceToScreenReader("Link dialog opened");
      }
    };

    const handleOpenAccessibilitySettings = () => {
      setIsAccessibilitySettingsOpen(true);
      announceToScreenReader("Accessibility settings dialog opened");
    };

    document.addEventListener("openLinkDialog", handleOpenLinkDialog);
    document.addEventListener(
      "openAccessibilitySettings",
      handleOpenAccessibilitySettings
    );

    return () => {
      document.removeEventListener("openLinkDialog", handleOpenLinkDialog);
      document.removeEventListener(
        "openAccessibilitySettings",
        handleOpenAccessibilitySettings
      );
    };
  }, [editor, announceToScreenReader]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <MultiModeEditor
      mode={mode}
      onModeChange={handleModeChange}
      showModeToggle={showModeToggle && !isMobile} // Hide mode toggle on mobile, use gestures instead
      showWordCount={showWordCount}
      showReadingTime={showReadingTime}
      wordCount={stats.wordCount}
      readingTime={stats.readingTime}
      className={cn("w-full", isMobile && "mobile-editor-container")}
      ref={containerRef as React.RefObject<HTMLDivElement>}
    >
      {editor && (
        <>
          <BubbleMenu editor={editor} />
          <TableBubbleMenu editor={editor} />
          {customToolbar ? (
            customToolbar(editor)
          ) : (
            <>
              <FloatingToolbar editor={editor} />
              <AdaptiveFloatingToolbar editor={editor} mode={mode} />
              {showContextualToolbar && (
                <ContextualToolbar
                  editor={editor}
                  minimal={mode === "focus" || distractionFreeMode}
                  autoHide={distractionFreeMode}
                />
              )}
            </>
          )}
        </>
      )}
      <EditorContent
        id="editor-content"
        editor={editor}
        className={cn(
          "w-full rounded-md border border-input bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          settings.reducedMotion
            ? "transition-none"
            : "transition-all duration-200",
          settings.highContrast && "border-2 border-foreground",
          distractionFreeMode && "editor-distraction-free",
          isMobile && "mobile-editor-content",
          isMobile && mode === "focus" && "mobile-focus-mode",
          "focus-visible"
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

      {/* Enhanced Stats Display */}
      {!autoSave && (showWordCount || showReadingTime) && (
        <EditorStatsDisplay
          editor={editor}
          minimal={mode === "focus" || distractionFreeMode}
          showWordCount={showWordCount}
          showReadingTime={showReadingTime}
          showCharacterCount={mode !== "focus"}
          showReadingLevel={mode === "normal"}
        />
      )}

      {/* Typography Settings */}
      {editable && mode === "normal" && (
        <TypographySettings
          editor={editor}
          className="fixed bottom-20 right-6 z-40"
        />
      )}

      {/* Accessibility information for screen readers */}
      <div id="editor-keyboard-help" className="sr-only">
        Rich text editor. Press Cmd+/ or Ctrl+/ to view keyboard shortcuts. Use
        Tab to navigate between elements.
      </div>
      <div id="editor-accessibility-info" className="sr-only">
        {settings.screenReaderOptimized &&
          "Screen reader optimized mode is enabled. "}
        {settings.keyboardNavigation &&
          "Enhanced keyboard navigation is enabled. "}
        Use arrow keys to navigate text, Enter to create new paragraphs, and
        slash commands for formatting.
      </div>

      {/* Skip link for keyboard users */}
      <a
        href="#editor-content"
        className="skip-link"
        onFocus={() => announceToScreenReader("Skip to editor content")}
      >
        Skip to editor content
      </a>

      {editor && (
        <>
          <LinkDialog
            editor={editor}
            isOpen={isLinkDialogOpen}
            onClose={() => {
              setIsLinkDialogOpen(false);
              announceToScreenReader("Link dialog closed");
            }}
          />
          <KeyboardShortcutsDialog
            isOpen={isHelpOpen}
            onClose={() => {
              setIsHelpOpen(false);
              announceToScreenReader("Keyboard shortcuts dialog closed");
            }}
          />
          <AccessibilitySettingsDialog
            isOpen={isAccessibilitySettingsOpen}
            onClose={() => {
              setIsAccessibilitySettingsOpen(false);
              announceToScreenReader("Accessibility settings dialog closed");
            }}
          />
        </>
      )}

      {/* Accessibility settings button */}
      {editable && (
        <button
          onClick={() => setIsAccessibilitySettingsOpen(true)}
          className={cn(
            "fixed bottom-4 right-4 z-50",
            "w-12 h-12 rounded-full",
            "bg-primary text-primary-foreground",
            "shadow-lg hover:shadow-xl",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "transition-all duration-200",
            settings.reducedMotion && "transition-none"
          )}
          aria-label="Open accessibility settings"
          title="Accessibility Settings (Alt+A)"
        >
          <span className="sr-only">Open accessibility settings</span>♿
        </button>
      )}
    </MultiModeEditor>
  );
}

export function NotionEditor(props: NotionEditorProps) {
  return (
    <AccessibilityProvider>
      <NotionEditorInner {...props} />
    </AccessibilityProvider>
  );
}

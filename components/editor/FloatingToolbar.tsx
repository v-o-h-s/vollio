"use client";

import { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Palette,
  MoreHorizontal,
  Quote,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  editor: Editor;
  className?: string;
}

interface ToolbarPosition {
  top: number;
  left: number;
  visible: boolean;
}

export function FloatingToolbar({ editor, className }: FloatingToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
    visible: false,
  });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const { selection } = editor.state;
      const { from, to, empty } = selection;

      // Hide toolbar if no selection or selection is empty
      if (empty) {
        setPosition((prev) => ({ ...prev, visible: false }));
        return;
      }

      // Get the DOM range for the selection
      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      if (!start || !end) {
        setPosition((prev) => ({ ...prev, visible: false }));
        return;
      }

      // Calculate toolbar position
      const selectionWidth = end.left - start.left;
      const selectionCenter = start.left + selectionWidth / 2;

      // Position toolbar above the selection
      const toolbarWidth = toolbarRef.current?.offsetWidth || 300;
      const left = Math.max(10, selectionCenter - toolbarWidth / 2);
      const top = start.top - 60; // Position above selection

      setPosition({
        top: Math.max(10, top),
        left,
        visible: true,
      });
    };

    // Update position on selection change
    const handleSelectionUpdate = () => {
      // Small delay to ensure DOM is updated
      setTimeout(updatePosition, 10);
    };

    // Listen to editor events
    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("transaction", handleSelectionUpdate);

    // Handle window resize and scroll
    const handleResize = () => {
      if (position.visible) {
        updatePosition();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("transaction", handleSelectionUpdate);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [editor, position.visible]);

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        // Don't hide if clicking in the editor
        const editorElement = editor.view.dom;
        if (!editorElement.contains(event.target as Node)) {
          setPosition((prev) => ({ ...prev, visible: false }));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editor]);

  if (!position.visible) {
    return null;
  }

  const handleCommand = (command: () => void) => {
    command();
    editor.view.focus();
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed z-50 flex items-center gap-1 rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-1",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          handleCommand(() => editor.chain().focus().toggleBold().run())
        }
        data-active={editor.isActive("bold")}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          handleCommand(() => editor.chain().focus().toggleItalic().run())
        }
        data-active={editor.isActive("italic")}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          handleCommand(() => editor.chain().focus().toggleUnderline().run())
        }
        data-active={editor.isActive("underline")}
        aria-label="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          handleCommand(() => editor.chain().focus().toggleStrike().run())
        }
        data-active={editor.isActive("strike")}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Code */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          handleCommand(() => editor.chain().focus().toggleCode().run())
        }
        data-active={editor.isActive("code")}
        aria-label="Inline Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      {/* Link */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            handleCommand(() =>
              editor.chain().focus().setLink({ href: url }).run()
            );
          }
        }}
        data-active={editor.isActive("link")}
        aria-label="Add Link"
      >
        <Link className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          handleCommand(() => editor.chain().focus().toggleBlockquote().run())
        }
        data-active={editor.isActive("blockquote")}
        aria-label="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      {/* Text Style */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          // Toggle between paragraph and heading
          if (editor.isActive("heading")) {
            handleCommand(() => editor.chain().focus().setParagraph().run());
          } else {
            handleCommand(() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            );
          }
        }}
        data-active={editor.isActive("heading")}
        aria-label="Heading"
      >
        <Type className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* More Options */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          // You can implement a dropdown menu here for more options
          console.log("More options clicked");
        }}
        aria-label="More Options"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {/* Color/Highlight - placeholder for future enhancement */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          // Placeholder for color/highlight functionality
          console.log("Color options clicked");
        }}
        aria-label="Text Color"
      >
        <Palette className="h-4 w-4" />
      </Button>
    </div>
  );
}

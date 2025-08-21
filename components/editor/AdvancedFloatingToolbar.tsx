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
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils";

interface AdvancedFloatingToolbarProps {
  editor: Editor;
  className?: string;
}

interface ToolbarPosition {
  top: number;
  left: number;
  visible: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Orange", value: "#fed7aa" },
];

const TEXT_COLORS = [
  { name: "Default", value: "" },
  { name: "Red", value: "#ef4444" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f59e0b" },
];

export function AdvancedFloatingToolbar({
  editor,
  className,
}: AdvancedFloatingToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
    visible: false,
  });
  // const [linkUrl, setLinkUrl] = useState('');
  // const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const { selection } = editor.state;
      const { from, to, empty } = selection;

      if (empty) {
        setPosition((prev) => ({ ...prev, visible: false }));
        return;
      }

      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      if (!start || !end) {
        setPosition((prev) => ({ ...prev, visible: false }));
        return;
      }

      const selectionWidth = end.left - start.left;
      const selectionCenter = start.left + selectionWidth / 2;

      const toolbarWidth = toolbarRef.current?.offsetWidth || 400;
      const left = Math.max(10, selectionCenter - toolbarWidth / 2);
      const top = start.top - 70;

      setPosition({
        top: Math.max(10, top),
        left,
        visible: true,
      });
    };

    const handleSelectionUpdate = () => {
      setTimeout(updatePosition, 10);
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("transaction", handleSelectionUpdate);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
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

  // const handleLinkSubmit = () => {
  //   if (linkUrl) {
  //     handleCommand(() =>
  //       editor.chain().focus().setLink({ href: linkUrl }).run()
  //     );
  //   } else {
  //     handleCommand(() =>
  //       editor.chain().focus().unsetLink().run()
  //     );
  //   }
  //   setLinkUrl('');
  //   setIsLinkPopoverOpen(false);
  // };

  // Placeholder functions for future enhancement
  const handleHighlight = () => {
    console.log('Highlight functionality - requires @tiptap/extension-highlight package');
  };

  const handleTextColor = () => {
    console.log('Text color functionality - requires @tiptap/extension-color package');
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed z-50 flex items-center gap-1 rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-1 floating-toolbar",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Text Formatting Group */}
      <div className="flex items-center gap-1">
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
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Code and Link Group */}
      <div className="flex items-center gap-1">
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
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Color and Highlight Group - Placeholder */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleTextColor}
          aria-label="Text Color (Coming Soon)"
          disabled
        >
          <Palette className="h-4 w-4 opacity-50" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleHighlight}
          aria-label="Highlight (Coming Soon)"
          disabled
        >
          <Highlighter className="h-4 w-4 opacity-50" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Formatting Group */}
      <div className="flex items-center gap-1">
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

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
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

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() =>
            handleCommand(() => editor.chain().focus().toggleBulletList().run())
          }
          data-active={editor.isActive("bulletList")}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() =>
            handleCommand(() =>
              editor.chain().focus().toggleOrderedList().run()
            )
          }
          data-active={editor.isActive("orderedList")}
          aria-label="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

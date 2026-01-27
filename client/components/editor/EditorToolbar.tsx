"use client";

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { EditorToolbarProps, EditorCommand } from "./types";
import type { Editor } from "@tiptap/react";

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const commands: EditorCommand[] = [
    {
      name: "undo",
      label: "Undo",
      icon: Undo,
      action: (e: Editor) => e.chain().focus().undo().run(),
      isDisabled: (e: Editor) => !e.can().undo(),
    },
    {
      name: "redo",
      label: "Redo",
      icon: Redo,
      action: (e: Editor) => e.chain().focus().redo().run(),
      isDisabled: (e: Editor) => !e.can().redo(),
    },
    {
      name: "bold",
      label: "Bold",
      icon: Bold,
      action: (e: Editor) => e.chain().focus().toggleBold().run(),
      isActive: (e: Editor) => e.isActive("bold"),
    },
    {
      name: "italic",
      label: "Italic",
      icon: Italic,
      action: (e: Editor) => e.chain().focus().toggleItalic().run(),
      isActive: (e: Editor) => e.isActive("italic"),
    },
    {
      name: "underline",
      label: "Underline",
      icon: Underline,
      action: (e: Editor) => e.chain().focus().toggleUnderline().run(),
      isActive: (e: Editor) => e.isActive("underline"),
    },
    {
      name: "strike",
      label: "Strikethrough",
      icon: Strikethrough,
      action: (e: Editor) => e.chain().focus().toggleStrike().run(),
      isActive: (e: Editor) => e.isActive("strike"),
    },
    {
      name: "heading1",
      label: "Heading 1",
      icon: Heading1,
      action: (e: Editor) =>
        e.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (e: Editor) => e.isActive("heading", { level: 1 }),
    },
    {
      name: "heading2",
      label: "Heading 2",
      icon: Heading2,
      action: (e: Editor) =>
        e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e: Editor) => e.isActive("heading", { level: 2 }),
    },
    {
      name: "heading3",
      label: "Heading 3",
      icon: Heading3,
      action: (e: Editor) =>
        e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e: Editor) => e.isActive("heading", { level: 3 }),
    },
    {
      name: "bulletList",
      label: "Bullet List",
      icon: List,
      action: (e: Editor) => e.chain().focus().toggleBulletList().run(),
      isActive: (e: Editor) => e.isActive("bulletList"),
    },
    {
      name: "orderedList",
      label: "Ordered List",
      icon: ListOrdered,
      action: (e: Editor) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e: Editor) => e.isActive("orderedList"),
    },
    {
      name: "blockquote",
      label: "Blockquote",
      icon: Quote,
      action: (e: Editor) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e: Editor) => e.isActive("blockquote"),
    },
    {
      name: "codeBlock",
      label: "Code Block",
      icon: Code,
      action: (e: Editor) => e.chain().focus().toggleCodeBlock().run(),
      isActive: (e: Editor) => e.isActive("codeBlock"),
    },
    {
      name: "horizontalRule",
      label: "Horizontal Rule",
      icon: Minus,
      action: (e: Editor) => e.chain().focus().setHorizontalRule().run(),
    },
  ];

  const formatCommands = commands.slice(2, 6); // Bold, Italic, Underline, Strike
  const headingCommands = commands.slice(6, 9); // H1, H2, H3
  const listCommands = commands.slice(9, 11); // Bullet, Ordered
  const blockCommands = commands.slice(11); // Blockquote, Code, HR
  const historyCommands = commands.slice(0, 2); // Undo, Redo

  const renderCommandGroup = (commands: EditorCommand[]) => (
    <div className="flex items-center space-x-1">
      {commands.map((command) => {
        const Icon = command.icon;
        const isActive = command.isActive?.(editor) || false;
        const isDisabled = command.isDisabled?.(editor) || false;

        return (
          <Button
            key={command.name}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => command.action(editor)}
            disabled={isDisabled}
            className={cn(
              "h-8 w-8 p-0",
              isActive && "bg-primary text-primary-foreground",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
            title={command.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-center space-x-2 p-2 border-b border-border bg-muted/50",
        className
      )}
    >
      {renderCommandGroup(historyCommands)}
      <Separator orientation="vertical" className="h-6" />
      {renderCommandGroup(formatCommands)}
      <Separator orientation="vertical" className="h-6" />
      {renderCommandGroup(headingCommands)}
      <Separator orientation="vertical" className="h-6" />
      {renderCommandGroup(listCommands)}
      <Separator orientation="vertical" className="h-6" />
      {renderCommandGroup(blockCommands)}
    </div>
  );
}

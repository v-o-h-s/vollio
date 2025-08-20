"use client";

import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";

interface BubbleMenuProps {
  editor: Editor;
  className?: string;
}

export function BubbleMenu({ editor, className }: BubbleMenuProps) {
  if (!editor) {
    return null;
  }

  const formatCommands = [
    {
      name: "bold",
      label: "Bold",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
      shortcut: "Ctrl+B",
    },
    {
      name: "italic",
      label: "Italic",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
      shortcut: "Ctrl+I",
    },
    {
      name: "underline",
      label: "Underline",
      icon: Underline,
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
      shortcut: "Ctrl+U",
    },
    {
      name: "strike",
      label: "Strikethrough",
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
      shortcut: "Ctrl+Shift+X",
    },
  ];

  const linkCommand = {
    name: "link",
    label: "Link",
    icon: Link,
    action: () => {
      // Trigger link dialog
      const event = new CustomEvent("openLinkDialog");
      document.dispatchEvent(event);
    },
    isActive: () => editor.isActive("enhancedLink"),
    shortcut: "Ctrl+K",
  };

  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const updateMenu = () => {
      const { selection } = editor.state;
      const { empty } = selection;

      if (empty || !menuRef.current) {
        setIsVisible(false);
        return;
      }

      // Show menu when text is selected
      setIsVisible(true);

      // Position the menu
      const { from, to } = selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      
      const menu = menuRef.current;
      const editorRect = editor.view.dom.getBoundingClientRect();
      
      // Calculate position
      const left = Math.max(0, (start.left + end.left) / 2 - menu.offsetWidth / 2);
      const top = start.top - menu.offsetHeight - 10;

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    };

    const handleSelectionUpdate = () => {
      setTimeout(updateMenu, 10);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
    };
  }, [editor]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg",
        className
      )}
      style={{ position: 'fixed' }}
    >
      {formatCommands.map((command) => {
        const Icon = command.icon;
        const isActive = command.isActive();

        return (
          <Button
            key={command.name}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={command.action}
            className={cn(
              "h-8 w-8 p-0",
              isActive && "bg-primary text-primary-foreground"
            )}
            title={`${command.label} (${command.shortcut})`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant={linkCommand.isActive() ? "default" : "ghost"}
        size="sm"
        onClick={linkCommand.action}
        className={cn(
          "h-8 w-8 p-0",
          linkCommand.isActive() && "bg-primary text-primary-foreground"
        )}
        title={`${linkCommand.label} (${linkCommand.shortcut})`}
      >
        <Link className="h-4 w-4" />
      </Button>
    </div>
  );
}

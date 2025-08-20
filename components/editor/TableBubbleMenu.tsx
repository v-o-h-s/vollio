'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  MoreHorizontal,
  MoreVertical,
  Table
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/react';

interface TableBubbleMenuProps {
  editor: Editor;
  className?: string;
}

export function TableBubbleMenu({ editor, className }: TableBubbleMenuProps) {
  if (!editor) {
    return null;
  }

  const shouldShow = () => {
    return editor.isActive('table');
  };

  const tableCommands = [
    {
      name: 'addColumnBefore',
      label: 'Add Column Before',
      icon: Plus,
      action: () => editor.chain().focus().addColumnBefore().run(),
      canExecute: () => editor.can().addColumnBefore(),
    },
    {
      name: 'addColumnAfter',
      label: 'Add Column After',
      icon: Plus,
      action: () => editor.chain().focus().addColumnAfter().run(),
      canExecute: () => editor.can().addColumnAfter(),
    },
    {
      name: 'deleteColumn',
      label: 'Delete Column',
      icon: MoreVertical,
      action: () => editor.chain().focus().deleteColumn().run(),
      canExecute: () => editor.can().deleteColumn(),
      variant: 'destructive' as const,
    },
    {
      name: 'addRowBefore',
      label: 'Add Row Before',
      icon: Plus,
      action: () => editor.chain().focus().addRowBefore().run(),
      canExecute: () => editor.can().addRowBefore(),
    },
    {
      name: 'addRowAfter',
      label: 'Add Row After',
      icon: Plus,
      action: () => editor.chain().focus().addRowAfter().run(),
      canExecute: () => editor.can().addRowAfter(),
    },
    {
      name: 'deleteRow',
      label: 'Delete Row',
      icon: MoreHorizontal,
      action: () => editor.chain().focus().deleteRow().run(),
      canExecute: () => editor.can().deleteRow(),
      variant: 'destructive' as const,
    },
    {
      name: 'deleteTable',
      label: 'Delete Table',
      icon: Trash2,
      action: () => editor.chain().focus().deleteTable().run(),
      canExecute: () => editor.can().deleteTable(),
      variant: 'destructive' as const,
    },
  ];

  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const updateMenu = () => {
      if (!shouldShow() || !menuRef.current) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);

      // Position the menu
      const { selection } = editor.state;
      const { from } = selection;
      const coords = editor.view.coordsAtPos(from);
      
      const menu = menuRef.current;
      
      // Calculate position
      const left = Math.max(0, coords.left - menu.offsetWidth / 2);
      const top = coords.top - menu.offsetHeight - 10;

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
  }, [editor, shouldShow]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-lg',
        className
      )}
      style={{ position: 'fixed' }}
    >
      <div className="flex items-center gap-1">
        <Table className="h-4 w-4 text-muted-foreground mr-2" />
        
        {/* Column operations */}
        <div className="flex items-center gap-1">
          {tableCommands.slice(0, 3).map((command) => {
            const Icon = command.icon;
            const canExecute = command.canExecute();

            return (
              <Button
                key={command.name}
                variant={command.variant || 'ghost'}
                size="sm"
                onClick={command.action}
                disabled={!canExecute}
                className="h-8 w-8 p-0"
                title={command.label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Row operations */}
        <div className="flex items-center gap-1">
          {tableCommands.slice(3, 6).map((command) => {
            const Icon = command.icon;
            const canExecute = command.canExecute();

            return (
              <Button
                key={command.name}
                variant={command.variant || 'ghost'}
                size="sm"
                onClick={command.action}
                disabled={!canExecute}
                className="h-8 w-8 p-0"
                title={command.label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Delete table */}
        <Button
          variant="ghost"
          size="sm"
          onClick={tableCommands[6].action}
          disabled={!tableCommands[6].canExecute()}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          title={tableCommands[6].label}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
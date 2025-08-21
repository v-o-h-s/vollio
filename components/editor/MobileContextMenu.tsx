'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Copy,
  Cut,
  Clipboard,
  Bold,
  Italic,
  Underline,
  Link,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHapticFeedback } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface MobileContextMenuProps {
  editor: Editor;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export function MobileContextMenu({
  editor,
  isVisible,
  position,
  onClose,
  className,
}: MobileContextMenuProps) {
  const [menuItems, setMenuItems] = useState<ContextMenuItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const { tapFeedback, successFeedback } = useHapticFeedback();

  // Update menu items based on current selection and editor state
  useEffect(() => {
    if (!isVisible) return;

    const { selection } = editor.state;
    const { empty } = selection;
    const hasSelection = !empty;

    const items: ContextMenuItem[] = [];

    if (hasSelection) {
      // Text selection actions
      items.push(
        {
          id: 'copy',
          label: 'Copy',
          icon: Copy,
          action: () => {
            document.execCommand('copy');
            successFeedback();
            onClose();
          },
        },
        {
          id: 'cut',
          label: 'Cut',
          icon: Cut,
          action: () => {
            document.execCommand('cut');
            successFeedback();
            onClose();
          },
        }
      );

      // Formatting actions
      items.push(
        {
          id: 'bold',
          label: editor.isActive('bold') ? 'Remove Bold' : 'Bold',
          icon: Bold,
          action: () => {
            editor.chain().focus().toggleBold().run();
            tapFeedback();
            onClose();
          },
        },
        {
          id: 'italic',
          label: editor.isActive('italic') ? 'Remove Italic' : 'Italic',
          icon: Italic,
          action: () => {
            editor.chain().focus().toggleItalic().run();
            tapFeedback();
            onClose();
          },
        },
        {
          id: 'underline',
          label: editor.isActive('underline') ? 'Remove Underline' : 'Underline',
          icon: Underline,
          action: () => {
            editor.chain().focus().toggleUnderline().run();
            tapFeedback();
            onClose();
          },
        }
      );

      // Link action
      if (editor.isActive('link')) {
        items.push({
          id: 'unlink',
          label: 'Remove Link',
          icon: Link,
          action: () => {
            editor.chain().focus().unsetLink().run();
            tapFeedback();
            onClose();
          },
        });
      } else {
        items.push({
          id: 'link',
          label: 'Add Link',
          icon: Link,
          action: () => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
              successFeedback();
            }
            onClose();
          },
        });
      }

      // Delete action
      items.push({
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        action: () => {
          editor.chain().focus().deleteSelection().run();
          tapFeedback();
          onClose();
        },
        destructive: true,
      });
    } else {
      // Cursor position actions
      items.push({
        id: 'paste',
        label: 'Paste',
        icon: Clipboard,
        action: async () => {
          try {
            const text = await navigator.clipboard.readText();
            editor.chain().focus().insertContent(text).run();
            successFeedback();
          } catch (error) {
            console.warn('Failed to paste:', error);
          }
          onClose();
        },
        disabled: !navigator.clipboard,
      });
    }

    setMenuItems(items);
  }, [editor, isVisible, onClose, tapFeedback, successFeedback]);

  // Handle click outside to close menu
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleTouchOutside = (event: TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, [isVisible, onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  // Calculate menu position to keep it on screen
  const getMenuStyle = () => {
    if (!menuRef.current) return { left: position.x, top: position.y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = position.x;
    let top = position.y;

    // Adjust horizontal position
    if (left + menuRect.width > viewportWidth - 20) {
      left = viewportWidth - menuRect.width - 20;
    }
    if (left < 20) {
      left = 20;
    }

    // Adjust vertical position
    if (top + menuRect.height > viewportHeight - 20) {
      top = position.y - menuRect.height - 10;
    }
    if (top < 20) {
      top = 20;
    }

    return { left, top };
  };

  if (!isVisible || menuItems.length === 0) {
    return null;
  }

  const menuStyle = getMenuStyle();

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 min-w-[200px] rounded-lg border bg-background shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      style={menuStyle}
    >
      <div className="p-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start gap-3 h-10 px-3',
                item.destructive && 'text-destructive hover:text-destructive',
                index === 0 && 'mt-0',
                index === menuItems.length - 1 && 'mb-0'
              )}
              onClick={item.action}
              disabled={item.disabled}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
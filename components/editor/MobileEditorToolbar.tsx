'use client';

import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Quote,
  Type,
  List,
  ListOrdered,
  Image,
  Minus,
  Table,
  ChevronLeft,
  ChevronRight,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MobileEditorToolbarProps {
  editor: Editor;
  isVisible: boolean;
  onClose?: () => void;
  className?: string;
}

interface ToolbarGroup {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ToolbarItem[];
}

interface ToolbarItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isActive?: () => boolean;
  disabled?: boolean;
}

export function MobileEditorToolbar({
  editor,
  isVisible,
  onClose,
  className,
}: MobileEditorToolbarProps) {
  const [activeGroup, setActiveGroup] = useState<string>('formatting');
  const [isExpanded, setIsExpanded] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Define toolbar groups and items
  const toolbarGroups: ToolbarGroup[] = [
    {
      id: 'formatting',
      name: 'Format',
      icon: Bold,
      items: [
        {
          id: 'bold',
          name: 'Bold',
          icon: Bold,
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: () => editor.isActive('bold'),
        },
        {
          id: 'italic',
          name: 'Italic',
          icon: Italic,
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: () => editor.isActive('italic'),
        },
        {
          id: 'underline',
          name: 'Underline',
          icon: Underline,
          action: () => editor.chain().focus().toggleUnderline().run(),
          isActive: () => editor.isActive('underline'),
        },
        {
          id: 'strikethrough',
          name: 'Strike',
          icon: Strikethrough,
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: () => editor.isActive('strike'),
        },
        {
          id: 'code',
          name: 'Code',
          icon: Code,
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: () => editor.isActive('code'),
        },
      ],
    },
    {
      id: 'blocks',
      name: 'Blocks',
      icon: Type,
      items: [
        {
          id: 'heading1',
          name: 'Heading 1',
          icon: Type,
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: () => editor.isActive('heading', { level: 1 }),
        },
        {
          id: 'heading2',
          name: 'Heading 2',
          icon: Type,
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: () => editor.isActive('heading', { level: 2 }),
        },
        {
          id: 'heading3',
          name: 'Heading 3',
          icon: Type,
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: () => editor.isActive('heading', { level: 3 }),
        },
        {
          id: 'paragraph',
          name: 'Paragraph',
          icon: Type,
          action: () => editor.chain().focus().setParagraph().run(),
          isActive: () => editor.isActive('paragraph'),
        },
        {
          id: 'blockquote',
          name: 'Quote',
          icon: Quote,
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: () => editor.isActive('blockquote'),
        },
      ],
    },
    {
      id: 'lists',
      name: 'Lists',
      icon: List,
      items: [
        {
          id: 'bulletList',
          name: 'Bullet List',
          icon: List,
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: () => editor.isActive('bulletList'),
        },
        {
          id: 'orderedList',
          name: 'Numbered List',
          icon: ListOrdered,
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: () => editor.isActive('orderedList'),
        },
      ],
    },
    {
      id: 'insert',
      name: 'Insert',
      icon: Image,
      items: [
        {
          id: 'link',
          name: 'Link',
          icon: Link,
          action: () => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          },
          isActive: () => editor.isActive('link'),
        },
        {
          id: 'image',
          name: 'Image',
          icon: Image,
          action: () => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          },
        },
        {
          id: 'divider',
          name: 'Divider',
          icon: Minus,
          action: () => editor.chain().focus().setHorizontalRule().run(),
        },
        {
          id: 'table',
          name: 'Table',
          icon: Table,
          action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        },
      ],
    },
  ];

  const currentGroup = toolbarGroups.find(group => group.id === activeGroup);

  // Handle click outside to close expanded toolbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      if (event.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          onClose?.();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isExpanded, onClose]);

  if (!isVisible) {
    return null;
  }

  const handleItemAction = (item: ToolbarItem) => {
    item.action();
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border',
        'transform transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : 'translate-y-full',
        className
      )}
    >
      {/* Compact toolbar - always visible */}
      <div className="flex items-center justify-between p-2 min-h-[60px]">
        {/* Quick access buttons */}
        <div className="flex items-center gap-1">
          {toolbarGroups.slice(0, 4).map((group) => {
            const Icon = group.icon;
            return (
              <Button
                key={group.id}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => {
                  setActiveGroup(group.id);
                  setIsExpanded(!isExpanded);
                }}
                data-active={activeGroup === group.id}
                aria-label={group.name}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={onClose}
              aria-label="Close toolbar"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded toolbar */}
      {isExpanded && currentGroup && (
        <div className="border-t border-border bg-muted/50">
          {/* Group navigation */}
          <div className="flex items-center justify-between p-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const currentIndex = toolbarGroups.findIndex(g => g.id === activeGroup);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : toolbarGroups.length - 1;
                  setActiveGroup(toolbarGroups[prevIndex].id);
                }}
                aria-label="Previous group"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium">{currentGroup.name}</span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const currentIndex = toolbarGroups.findIndex(g => g.id === activeGroup);
                  const nextIndex = currentIndex < toolbarGroups.length - 1 ? currentIndex + 1 : 0;
                  setActiveGroup(toolbarGroups[nextIndex].id);
                }}
                aria-label="Next group"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Group items */}
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2">
              {currentGroup.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive?.() || false;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="h-12 flex flex-col gap-1 text-xs"
                    onClick={() => handleItemAction(item)}
                    disabled={item.disabled}
                    aria-label={item.name}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{item.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
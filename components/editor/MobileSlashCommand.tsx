'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Link,
  Minus,
  Table,
  CheckSquare,
  Calendar,
  Hash,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHapticFeedback } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface MobileSlashCommandProps {
  editor: Editor;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  category: string;
  action: () => void;
}

interface CommandCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: CommandItem[];
}

export function MobileSlashCommand({
  editor,
  isVisible,
  position,
  onClose,
  className,
}: MobileSlashCommandProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState<CommandItem[]>([]);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { tapFeedback, successFeedback } = useHapticFeedback();

  // Define command categories and items
  const commandCategories: CommandCategory[] = [
    {
      id: 'basic',
      name: 'Basic',
      icon: Type,
      items: [
        {
          id: 'paragraph',
          title: 'Text',
          description: 'Start writing with plain text',
          icon: Type,
          keywords: ['text', 'paragraph', 'p'],
          category: 'basic',
          action: () => {
            editor.chain().focus().setParagraph().run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'heading1',
          title: 'Heading 1',
          description: 'Big section heading',
          icon: Heading1,
          keywords: ['heading', 'h1', 'title', 'big'],
          category: 'basic',
          action: () => {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'heading2',
          title: 'Heading 2',
          description: 'Medium section heading',
          icon: Heading2,
          keywords: ['heading', 'h2', 'subtitle'],
          category: 'basic',
          action: () => {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'heading3',
          title: 'Heading 3',
          description: 'Small section heading',
          icon: Heading3,
          keywords: ['heading', 'h3', 'subheading'],
          category: 'basic',
          action: () => {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
            successFeedback();
            onClose();
          },
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
          title: 'Bullet List',
          description: 'Create a simple bullet list',
          icon: List,
          keywords: ['bullet', 'list', 'ul', 'unordered'],
          category: 'lists',
          action: () => {
            editor.chain().focus().toggleBulletList().run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'orderedList',
          title: 'Numbered List',
          description: 'Create a numbered list',
          icon: ListOrdered,
          keywords: ['numbered', 'list', 'ol', 'ordered', '1', '2', '3'],
          category: 'lists',
          action: () => {
            editor.chain().focus().toggleOrderedList().run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'taskList',
          title: 'Task List',
          description: 'Create a task list with checkboxes',
          icon: CheckSquare,
          keywords: ['task', 'todo', 'checkbox', 'check'],
          category: 'lists',
          action: () => {
            // Note: This would require @tiptap/extension-task-list
            console.log('Task list - requires @tiptap/extension-task-list');
            tapFeedback();
            onClose();
          },
        },
      ],
    },
    {
      id: 'media',
      name: 'Media',
      icon: Image,
      items: [
        {
          id: 'image',
          title: 'Image',
          description: 'Upload or embed an image',
          icon: Image,
          keywords: ['image', 'photo', 'picture', 'img'],
          category: 'media',
          action: () => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
              successFeedback();
            }
            onClose();
          },
        },
        {
          id: 'link',
          title: 'Link',
          description: 'Add a link',
          icon: Link,
          keywords: ['link', 'url', 'href'],
          category: 'media',
          action: () => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
              successFeedback();
            }
            onClose();
          },
        },
      ],
    },
    {
      id: 'blocks',
      name: 'Blocks',
      icon: Hash,
      items: [
        {
          id: 'blockquote',
          title: 'Quote',
          description: 'Capture a quote',
          icon: Quote,
          keywords: ['quote', 'blockquote', 'citation'],
          category: 'blocks',
          action: () => {
            editor.chain().focus().toggleBlockquote().run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'codeBlock',
          title: 'Code Block',
          description: 'Create a code block',
          icon: Code,
          keywords: ['code', 'codeblock', 'pre', 'programming'],
          category: 'blocks',
          action: () => {
            editor.chain().focus().toggleCodeBlock().run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'divider',
          title: 'Divider',
          description: 'Add a horizontal divider',
          icon: Minus,
          keywords: ['divider', 'separator', 'hr', 'horizontal', 'rule'],
          category: 'blocks',
          action: () => {
            editor.chain().focus().setHorizontalRule().run();
            successFeedback();
            onClose();
          },
        },
        {
          id: 'table',
          title: 'Table',
          description: 'Add a table',
          icon: Table,
          keywords: ['table', 'grid', 'rows', 'columns'],
          category: 'blocks',
          action: () => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            successFeedback();
            onClose();
          },
        },
      ],
    },
  ];

  // Get all items from all categories
  const allItems = commandCategories.flatMap(category => category.items);

  // Filter items based on search query and selected category
  useEffect(() => {
    let items = selectedCategory === 'all' 
      ? allItems 
      : commandCategories.find(cat => cat.id === selectedCategory)?.items || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    setFilteredItems(items);
    setSelectedIndex(0);
  }, [searchQuery, selectedCategory, allItems, commandCategories]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, filteredItems, selectedIndex, onClose]);

  // Focus search input when visible
  useEffect(() => {
    if (isVisible && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  // Handle click outside to close
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  // Calculate menu position to keep it on screen
  const getMenuStyle = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 320;
    const menuHeight = 400;

    let left = position.x;
    let top = position.y;

    // Adjust horizontal position
    if (left + menuWidth > viewportWidth - 20) {
      left = viewportWidth - menuWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }

    // Adjust vertical position
    if (top + menuHeight > viewportHeight - 20) {
      top = position.y - menuHeight - 10;
    }
    if (top < 20) {
      top = 20;
    }

    return { left, top, width: menuWidth, maxHeight: menuHeight };
  };

  if (!isVisible) {
    return null;
  }

  const menuStyle = getMenuStyle();

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 bg-background border rounded-lg shadow-lg overflow-hidden',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      style={menuStyle}
    >
      {/* Header with search */}
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs whitespace-nowrap"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {commandCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs whitespace-nowrap flex items-center gap-1"
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon className="h-3 w-3" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Command list */}
      <div className="max-h-80 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No commands found
          </div>
        ) : (
          <div className="p-1">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              
              return (
                <Button
                  key={item.id}
                  variant={isSelected ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 h-auto p-3 mb-1',
                    'text-left whitespace-normal',
                    isSelected && 'bg-accent'
                  )}
                  onClick={() => {
                    item.action();
                    tapFeedback();
                  }}
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with keyboard hints */}
      <div className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
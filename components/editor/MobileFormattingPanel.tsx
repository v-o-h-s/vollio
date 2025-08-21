'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useHapticFeedback } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface MobileFormattingPanelProps {
  editor: Editor;
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

interface FormattingGroup {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: FormattingItem[];
}

interface FormattingItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isActive?: () => boolean;
  disabled?: boolean;
}

const TEXT_COLORS = [
  { name: 'Default', value: '', color: 'currentColor' },
  { name: 'Red', value: '#ef4444', color: '#ef4444' },
  { name: 'Orange', value: '#f97316', color: '#f97316' },
  { name: 'Yellow', value: '#eab308', color: '#eab308' },
  { name: 'Green', value: '#22c55e', color: '#22c55e' },
  { name: 'Blue', value: '#3b82f6', color: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6', color: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899', color: '#ec4899' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: '', color: 'transparent' },
  { name: 'Yellow', value: '#fef08a', color: '#fef08a' },
  { name: 'Green', value: '#bbf7d0', color: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe', color: '#bfdbfe' },
  { name: 'Purple', value: '#e9d5ff', color: '#e9d5ff' },
  { name: 'Pink', value: '#fbcfe8', color: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa', color: '#fed7aa' },
];

export function MobileFormattingPanel({
  editor,
  isVisible,
  onClose,
  className,
}: MobileFormattingPanelProps) {
  const [activeGroup, setActiveGroup] = useState<string>('text');
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'highlight' | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { tapFeedback, successFeedback } = useHapticFeedback();

  // Define formatting groups
  const formattingGroups: FormattingGroup[] = [
    {
      id: 'text',
      name: 'Text',
      icon: Bold,
      items: [
        {
          id: 'bold',
          name: 'Bold',
          icon: Bold,
          action: () => {
            editor.chain().focus().toggleBold().run();
            tapFeedback();
          },
          isActive: () => editor.isActive('bold'),
        },
        {
          id: 'italic',
          name: 'Italic',
          icon: Italic,
          action: () => {
            editor.chain().focus().toggleItalic().run();
            tapFeedback();
          },
          isActive: () => editor.isActive('italic'),
        },
        {
          id: 'underline',
          name: 'Underline',
          icon: Underline,
          action: () => {
            editor.chain().focus().toggleUnderline().run();
            tapFeedback();
          },
          isActive: () => editor.isActive('underline'),
        },
        {
          id: 'strikethrough',
          name: 'Strike',
          icon: Strikethrough,
          action: () => {
            editor.chain().focus().toggleStrike().run();
            tapFeedback();
          },
          isActive: () => editor.isActive('strike'),
        },
        {
          id: 'code',
          name: 'Code',
          icon: Code,
          action: () => {
            editor.chain().focus().toggleCode().run();
            tapFeedback();
          },
          isActive: () => editor.isActive('code'),
        },
      ],
    },
    {
      id: 'color',
      name: 'Color',
      icon: Palette,
      items: [
        {
          id: 'textColor',
          name: 'Text Color',
          icon: Palette,
          action: () => {
            setShowColorPicker('text');
            tapFeedback();
          },
        },
        {
          id: 'highlight',
          name: 'Highlight',
          icon: Highlighter,
          action: () => {
            setShowColorPicker('highlight');
            tapFeedback();
          },
        },
      ],
    },
    {
      id: 'align',
      name: 'Align',
      icon: AlignLeft,
      items: [
        {
          id: 'alignLeft',
          name: 'Left',
          icon: AlignLeft,
          action: () => {
            // Note: This would require @tiptap/extension-text-align
            console.log('Text align - requires @tiptap/extension-text-align');
            tapFeedback();
          },
          disabled: true,
        },
        {
          id: 'alignCenter',
          name: 'Center',
          icon: AlignCenter,
          action: () => {
            console.log('Text align - requires @tiptap/extension-text-align');
            tapFeedback();
          },
          disabled: true,
        },
        {
          id: 'alignRight',
          name: 'Right',
          icon: AlignRight,
          action: () => {
            console.log('Text align - requires @tiptap/extension-text-align');
            tapFeedback();
          },
          disabled: true,
        },
        {
          id: 'alignJustify',
          name: 'Justify',
          icon: AlignJustify,
          action: () => {
            console.log('Text align - requires @tiptap/extension-text-align');
            tapFeedback();
          },
          disabled: true,
        },
      ],
    },
  ];

  const currentGroup = formattingGroups.find(group => group.id === activeGroup);

  // Handle click outside to close
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  // Handle escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showColorPicker) {
          setShowColorPicker(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, showColorPicker, onClose]);

  const handleColorSelect = (color: string, type: 'text' | 'highlight') => {
    if (type === 'text') {
      // Note: This would require @tiptap/extension-color
      console.log('Text color - requires @tiptap/extension-color');
    } else {
      // Note: This would require @tiptap/extension-highlight
      console.log('Highlight - requires @tiptap/extension-highlight');
    }
    
    successFeedback();
    setShowColorPicker(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background border-t',
        'transform transition-transform duration-300 ease-in-out',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
    >
      {/* Color picker overlay */}
      {showColorPicker && (
        <div className="absolute bottom-full left-0 right-0 bg-background border-t border-l border-r rounded-t-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">
              {showColorPicker === 'text' ? 'Text Color' : 'Highlight Color'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowColorPicker(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {(showColorPicker === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS).map((color) => (
              <Button
                key={color.name}
                variant="outline"
                className="h-12 flex flex-col gap-1 p-2"
                onClick={() => handleColorSelect(color.value, showColorPicker)}
              >
                <div
                  className="w-6 h-4 rounded border"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-xs">{color.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main panel */}
      <div className="p-3">
        {/* Group navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const currentIndex = formattingGroups.findIndex(g => g.id === activeGroup);
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : formattingGroups.length - 1;
                setActiveGroup(formattingGroups[prevIndex].id);
                tapFeedback();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[60px] text-center">
              {currentGroup?.name}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const currentIndex = formattingGroups.findIndex(g => g.id === activeGroup);
                const nextIndex = currentIndex < formattingGroups.length - 1 ? currentIndex + 1 : 0;
                setActiveGroup(formattingGroups[nextIndex].id);
                tapFeedback();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Group tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {formattingGroups.map((group) => {
            const Icon = group.icon;
            return (
              <Button
                key={group.id}
                variant={activeGroup === group.id ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-3 flex items-center gap-2 whitespace-nowrap"
                onClick={() => {
                  setActiveGroup(group.id);
                  tapFeedback();
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{group.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Group items */}
        {currentGroup && (
          <div className="grid grid-cols-5 gap-2">
            {currentGroup.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive?.() || false;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="h-12 flex flex-col gap-1 text-xs"
                  onClick={item.action}
                  disabled={item.disabled}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.name}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
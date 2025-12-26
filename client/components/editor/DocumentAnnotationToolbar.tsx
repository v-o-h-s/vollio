'use client';

import { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Highlighter,
  MessageSquare,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DocumentAnnotationToolbarProps {
  editor: Editor;
  onSaveAnnotation?: (content: any) => void;
  onCancel?: () => void;
  className?: string;
}

interface ToolbarPosition {
  top: number;
  left: number;
  visible: boolean;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a', class: 'bg-yellow-200' },
  { name: 'Green', value: '#bbf7d0', class: 'bg-green-200' },
  { name: 'Blue', value: '#bfdbfe', class: 'bg-blue-200' },
  { name: 'Purple', value: '#e9d5ff', class: 'bg-purple-200' },
  { name: 'Pink', value: '#fbcfe8', class: 'bg-pink-200' },
];

export function DocumentAnnotationToolbar({ 
  editor, 
  onSaveAnnotation, 
  onCancel,
  className 
}: DocumentAnnotationToolbarProps) {
  const [position, setPosition] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
    visible: false,
  });
  const [selectedHighlight, setSelectedHighlight] = useState(HIGHLIGHT_COLORS[0]);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const { selection } = editor.state;
      const { from, to, empty } = selection;

      if (empty) {
        setPosition(prev => ({ ...prev, visible: false }));
        return;
      }

      const { view } = editor;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      if (!start || !end) {
        setPosition(prev => ({ ...prev, visible: false }));
        return;
      }

      const selectionWidth = end.left - start.left;
      const selectionCenter = start.left + selectionWidth / 2;
      
      const toolbarWidth = toolbarRef.current?.offsetWidth || 350;
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

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);

    const handleResize = () => {
      if (position.visible) {
        updatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [editor, position.visible]);

  if (!position.visible) {
    return null;
  }

  const handleCommand = (command: () => void) => {
    command();
    editor.view.focus();
  };

  const handleHighlight = (color: { name: string; value: string; class: string }) => {
    setSelectedHighlight(color);
    handleCommand(() => 
      editor.chain().focus().setHighlight({ color: color.value }).run()
    );
  };

  const handleSave = () => {
    const content = editor.getJSON();
    onSaveAnnotation?.(content);
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'fixed z-[55] flex items-center gap-1 rounded-lg border bg-background/95 backdrop-blur-sm shadow-lg p-2 floating-toolbar',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleCommand(() => editor.chain().focus().toggleBold().run())}
          data-active={editor.isActive('bold')}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleCommand(() => editor.chain().focus().toggleItalic().run())}
          data-active={editor.isActive('italic')}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleCommand(() => editor.chain().focus().toggleUnderline().run())}
          data-active={editor.isActive('underline')}
          aria-label="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleCommand(() => editor.chain().focus().toggleStrike().run())}
          data-active={editor.isActive('strike')}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Highlight Colors */}
      <div className="flex items-center gap-1">
        {HIGHLIGHT_COLORS.map((color) => (
          <Button
            key={color.name}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 border-2"
            style={{ 
              backgroundColor: color.value,
              borderColor: selectedHighlight.name === color.name ? '#374151' : 'transparent'
            }}
            onClick={() => handleHighlight(color)}
            aria-label={`Highlight ${color.name}`}
            title={`Highlight ${color.name}`}
          >
            <Highlighter className="h-3 w-3 text-gray-700" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Annotation Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={handleSave}
          aria-label="Save Annotation"
        >
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={onCancel}
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
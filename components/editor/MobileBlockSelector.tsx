'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileBlockSelectorProps {
  editor: Editor;
  className?: string;
}

interface BlockPosition {
  top: number;
  left: number;
  visible: boolean;
  nodePos: number;
}

export function MobileBlockSelector({ editor, className }: MobileBlockSelectorProps) {
  const [position, setPosition] = useState<BlockPosition>({
    top: 0,
    left: 0,
    visible: false,
    nodePos: -1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const { selection } = editor.state;
      const { $from } = selection;
      
      // Find the current block node
      let blockNode = null;
      let blockPos = -1;
      
      for (let depth = $from.depth; depth >= 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name !== 'doc') {
          blockNode = node;
          blockPos = $from.start(depth) - 1;
          break;
        }
      }

      if (!blockNode || blockPos === -1) {
        setPosition(prev => ({ ...prev, visible: false }));
        return;
      }

      // Get DOM coordinates for the block
      const { view } = editor;
      const coords = view.coordsAtPos(blockPos + 1);
      
      if (!coords) {
        setPosition(prev => ({ ...prev, visible: false }));
        return;
      }

      // Position the selector to the left of the block
      setPosition({
        top: coords.top,
        left: coords.left - 40, // Position to the left of the content
        visible: true,
        nodePos: blockPos,
      });
    };

    // Update position on selection change
    const handleSelectionUpdate = () => {
      setTimeout(updatePosition, 10);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);

    // Handle window resize and scroll
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

  // Handle touch events for drag and drop
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging || !dragStartPos.current) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const deltaY = touch.clientY - dragStartPos.current.y;
    
    // Visual feedback for drag operation
    if (selectorRef.current) {
      selectorRef.current.style.transform = `translateY(${deltaY}px)`;
      selectorRef.current.style.opacity = '0.8';
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!isDragging || !dragStartPos.current) return;
    
    const touch = event.changedTouches[0];
    const deltaY = touch.clientY - dragStartPos.current.y;
    
    // Reset visual state
    if (selectorRef.current) {
      selectorRef.current.style.transform = '';
      selectorRef.current.style.opacity = '';
    }
    
    // Determine if we should move the block
    if (Math.abs(deltaY) > 50) { // Minimum drag distance
      const direction = deltaY > 0 ? 'down' : 'up';
      moveBlock(direction);
    }
    
    setIsDragging(false);
    dragStartPos.current = null;
    
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const moveBlock = (direction: 'up' | 'down') => {
    const { selection } = editor.state;
    const { $from } = selection;
    
    // Find the current block
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'doc') {
        const pos = $from.start(depth) - 1;
        
        if (direction === 'up') {
          // Move block up
          const prevPos = editor.state.doc.resolve(pos).before(depth);
          if (prevPos > 0) {
            editor.chain().focus().setNodeSelection(pos).cut().insertContentAt(prevPos, node).run();
          }
        } else {
          // Move block down
          const nextPos = editor.state.doc.resolve(pos).after(depth);
          if (nextPos < editor.state.doc.content.size) {
            editor.chain().focus().setNodeSelection(pos).cut().insertContentAt(nextPos, node).run();
          }
        }
        break;
      }
    }
  };

  const duplicateBlock = () => {
    const { selection } = editor.state;
    const { $from } = selection;
    
    // Find and duplicate the current block
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'doc') {
        const pos = $from.after(depth);
        editor.chain().focus().insertContentAt(pos, node).run();
        break;
      }
    }
    
    setShowActions(false);
  };

  const deleteBlock = () => {
    const { selection } = editor.state;
    const { $from } = selection;
    
    // Find and delete the current block
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'doc') {
        const pos = $from.start(depth) - 1;
        const endPos = $from.end(depth) + 1;
        editor.chain().focus().deleteRange({ from: pos, to: endPos }).run();
        break;
      }
    }
    
    setShowActions(false);
  };

  const addBlockAbove = () => {
    const { selection } = editor.state;
    const { $from } = selection;
    
    // Add a new paragraph above the current block
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name !== 'doc') {
        const pos = $from.start(depth) - 1;
        editor.chain().focus().insertContentAt(pos, { type: 'paragraph' }).run();
        break;
      }
    }
    
    setShowActions(false);
  };

  if (!position.visible) {
    return null;
  }

  return (
    <>
      {/* Main drag handle */}
      <div
        ref={selectorRef}
        className={cn(
          'fixed z-40 flex items-center justify-center',
          'w-8 h-8 rounded-md border bg-background shadow-sm',
          'touch-manipulation select-none',
          isDragging && 'shadow-lg scale-110',
          className
        )}
        style={{
          top: position.top - 4,
          left: position.left,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setShowActions(!showActions)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Action menu */}
      {showActions && (
        <div
          className="fixed z-50 flex flex-col gap-1 p-2 rounded-lg border bg-background shadow-lg"
          style={{
            top: position.top,
            left: position.left + 40,
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={addBlockAbove}
            aria-label="Add block above"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => moveBlock('up')}
            aria-label="Move block up"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => moveBlock('down')}
            aria-label="Move block down"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={duplicateBlock}
            aria-label="Duplicate block"
          >
            <Copy className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={deleteBlock}
            aria-label="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Backdrop to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowActions(false)}
        />
      )}
    </>
  );
}
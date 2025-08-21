'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { useTouchGestures, useHapticFeedback } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface MobileTextSelectionProps {
  editor: Editor;
  onSelectionChange?: (hasSelection: boolean) => void;
  className?: string;
}

interface SelectionHandle {
  type: 'start' | 'end';
  x: number;
  y: number;
  visible: boolean;
}

export function MobileTextSelection({
  editor,
  onSelectionChange,
  className,
}: MobileTextSelectionProps) {
  const [startHandle, setStartHandle] = useState<SelectionHandle>({
    type: 'start',
    x: 0,
    y: 0,
    visible: false,
  });
  const [endHandle, setEndHandle] = useState<SelectionHandle>({
    type: 'end',
    x: 0,
    y: 0,
    visible: false,
  });
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  
  const startHandleRef = useRef<HTMLDivElement>(null);
  const endHandleRef = useRef<HTMLDivElement>(null);
  const { longPressFeedback, tapFeedback } = useHapticFeedback();

  // Update selection handles position
  const updateHandlePositions = useCallback(() => {
    const { selection } = editor.state;
    const { from, to, empty } = selection;

    if (empty) {
      setStartHandle(prev => ({ ...prev, visible: false }));
      setEndHandle(prev => ({ ...prev, visible: false }));
      setSelectionRect(null);
      onSelectionChange?.(false);
      return;
    }

    const { view } = editor;
    const startCoords = view.coordsAtPos(from);
    const endCoords = view.coordsAtPos(to);

    if (!startCoords || !endCoords) {
      setStartHandle(prev => ({ ...prev, visible: false }));
      setEndHandle(prev => ({ ...prev, visible: false }));
      setSelectionRect(null);
      onSelectionChange?.(false);
      return;
    }

    // Get selection rectangle for highlighting
    const range = document.createRange();
    const startNode = view.domAtPos(from);
    const endNode = view.domAtPos(to);
    
    if (startNode.node && endNode.node) {
      try {
        range.setStart(startNode.node, startNode.offset);
        range.setEnd(endNode.node, endNode.offset);
        const rect = range.getBoundingClientRect();
        setSelectionRect(rect);
      } catch (error) {
        console.warn('Failed to create selection range:', error);
      }
    }

    // Position handles
    setStartHandle({
      type: 'start',
      x: startCoords.left,
      y: startCoords.top - 20, // Position above the text
      visible: true,
    });

    setEndHandle({
      type: 'end',
      x: endCoords.left,
      y: endCoords.bottom + 5, // Position below the text
      visible: true,
    });

    onSelectionChange?.(true);
  }, [editor, onSelectionChange]);

  // Handle touch gestures for text selection
  const { attachToElement: attachTouchGestures } = useTouchGestures({
    onLongPress: (event) => {
      // Start text selection on long press
      const touch = event.touches[0];
      const pos = editor.view.posAtCoords({
        left: touch.clientX,
        top: touch.clientY,
      });

      if (pos) {
        // Select word at position
        const { state } = editor;
        const { doc } = state;
        const resolvedPos = doc.resolve(pos.pos);
        
        // Find word boundaries
        let start = pos.pos;
        let end = pos.pos;
        
        // Expand selection to word boundaries
        while (start > 0 && /\w/.test(doc.textBetween(start - 1, start))) {
          start--;
        }
        while (end < doc.content.size && /\w/.test(doc.textBetween(end, end + 1))) {
          end++;
        }

        if (start < end) {
          editor.chain().focus().setTextSelection({ from: start, to: end }).run();
          longPressFeedback();
        }
      }
    },
    onTap: (event) => {
      // Clear selection on tap if not on handles
      const target = event.target as Element;
      if (!target.closest('.selection-handle')) {
        editor.chain().focus().setTextSelection(editor.state.selection.from).run();
        tapFeedback();
      }
    },
  });

  // Handle drag for selection handles
  const handleHandleDrag = useCallback((
    handleType: 'start' | 'end',
    clientX: number,
    clientY: number
  ) => {
    const pos = editor.view.posAtCoords({
      left: clientX,
      top: clientY,
    });

    if (!pos) return;

    const { selection } = editor.state;
    const { from, to } = selection;

    if (handleType === 'start') {
      const newFrom = Math.min(pos.pos, to);
      editor.chain().focus().setTextSelection({ from: newFrom, to }).run();
    } else {
      const newTo = Math.max(pos.pos, from);
      editor.chain().focus().setTextSelection({ from, to: newTo }).run();
    }
  }, [editor]);

  // Touch handlers for selection handles
  const createHandleTouchHandlers = (handleType: 'start' | 'end') => ({
    onTouchStart: (event: React.TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(handleType);
      longPressFeedback();
    },
    onTouchMove: (event: React.TouchEvent) => {
      if (isDragging === handleType) {
        event.preventDefault();
        const touch = event.touches[0];
        handleHandleDrag(handleType, touch.clientX, touch.clientY);
      }
    },
    onTouchEnd: (event: React.TouchEvent) => {
      if (isDragging === handleType) {
        event.preventDefault();
        setIsDragging(null);
        tapFeedback();
      }
    },
  });

  // Listen to editor selection changes
  useEffect(() => {
    const handleSelectionUpdate = () => {
      setTimeout(updateHandlePositions, 10);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('transaction', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('transaction', handleSelectionUpdate);
    };
  }, [editor, updateHandlePositions]);

  // Attach touch gestures to editor
  useEffect(() => {
    const editorElement = editor.view.dom as HTMLElement;
    attachTouchGestures(editorElement);
  }, [editor, attachTouchGestures]);

  return (
    <div className={cn('mobile-text-selection', className)}>
      {/* Selection highlight overlay */}
      {selectionRect && (
        <div
          className="fixed pointer-events-none bg-primary/20 rounded-sm z-10"
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      )}

      {/* Start selection handle */}
      {startHandle.visible && (
        <div
          ref={startHandleRef}
          className={cn(
            'selection-handle fixed z-20 w-6 h-6 bg-primary rounded-full',
            'border-2 border-background shadow-lg',
            'flex items-center justify-center',
            'touch-manipulation select-none',
            isDragging === 'start' && 'scale-125'
          )}
          style={{
            left: startHandle.x - 12,
            top: startHandle.y - 12,
          }}
          {...createHandleTouchHandlers('start')}
        >
          <div className="w-2 h-2 bg-background rounded-full" />
        </div>
      )}

      {/* End selection handle */}
      {endHandle.visible && (
        <div
          ref={endHandleRef}
          className={cn(
            'selection-handle fixed z-20 w-6 h-6 bg-primary rounded-full',
            'border-2 border-background shadow-lg',
            'flex items-center justify-center',
            'touch-manipulation select-none',
            isDragging === 'end' && 'scale-125'
          )}
          style={{
            left: endHandle.x - 12,
            top: endHandle.y - 12,
          }}
          {...createHandleTouchHandlers('end')}
        >
          <div className="w-2 h-2 bg-background rounded-full" />
        </div>
      )}
    </div>
  );
}
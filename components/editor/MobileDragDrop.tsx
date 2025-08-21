'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { useTouchGestures, useHapticFeedback } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';

interface MobileDragDropProps {
  editor: Editor;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedNode: any;
  draggedPos: number;
  startY: number;
  currentY: number;
  dropZone: 'above' | 'below' | null;
  targetPos: number;
}

interface DropIndicator {
  visible: boolean;
  top: number;
  left: number;
  width: number;
}

export function MobileDragDrop({ editor, className }: MobileDragDropProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNode: null,
    draggedPos: -1,
    startY: 0,
    currentY: 0,
    dropZone: null,
    targetPos: -1,
  });
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
  });
  const [ghostElement, setGhostElement] = useState<HTMLElement | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { longPressFeedback, successFeedback, errorFeedback } = useHapticFeedback();

  // Find the block node at a given position
  const findBlockAtPos = useCallback((pos: number) => {
    const { state } = editor;
    const resolvedPos = state.doc.resolve(pos);
    
    for (let depth = resolvedPos.depth; depth >= 0; depth--) {
      const node = resolvedPos.node(depth);
      if (node.type.name !== 'doc') {
        return {
          node,
          pos: resolvedPos.start(depth) - 1,
          depth,
        };
      }
    }
    return null;
  }, [editor]);

  // Get DOM element for a block position
  const getDOMElementForPos = useCallback((pos: number) => {
    const { view } = editor;
    try {
      const domPos = view.domAtPos(pos);
      let element = domPos.node;
      
      // Find the closest block element
      while (element && element.nodeType !== Node.ELEMENT_NODE) {
        element = element.parentNode;
      }
      
      while (element && !element.classList?.contains('ProseMirror')) {
        if (element.nodeType === Node.ELEMENT_NODE && 
            (element as Element).matches('p, h1, h2, h3, ul, ol, blockquote, pre, hr, table')) {
          return element as HTMLElement;
        }
        element = element.parentNode;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get DOM element for position:', error);
      return null;
    }
  }, [editor]);

  // Create ghost element for drag preview
  const createGhostElement = useCallback((sourceElement: HTMLElement) => {
    const ghost = sourceElement.cloneNode(true) as HTMLElement;
    ghost.style.position = 'fixed';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '1000';
    ghost.style.opacity = '0.8';
    ghost.style.transform = 'rotate(5deg)';
    ghost.style.maxWidth = '300px';
    ghost.style.backgroundColor = 'var(--background)';
    ghost.style.border = '2px solid var(--primary)';
    ghost.style.borderRadius = '8px';
    ghost.style.padding = '8px';
    ghost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    
    document.body.appendChild(ghost);
    return ghost;
  }, []);

  // Update ghost element position
  const updateGhostPosition = useCallback((x: number, y: number) => {
    if (ghostElement) {
      ghostElement.style.left = `${x - 150}px`;
      ghostElement.style.top = `${y - 20}px`;
    }
  }, [ghostElement]);

  // Find drop target and show indicator
  const updateDropIndicator = useCallback((clientY: number) => {
    const editorElement = editor.view.dom;
    const editorRect = editorElement.getBoundingClientRect();
    
    // Find all block elements
    const blocks = Array.from(editorElement.querySelectorAll('p, h1, h2, h3, ul, ol, blockquote, pre, hr, table'));
    
    let closestBlock: HTMLElement | null = null;
    let closestDistance = Infinity;
    let dropZone: 'above' | 'below' = 'below';
    
    blocks.forEach((block) => {
      const rect = block.getBoundingClientRect();
      const blockCenter = rect.top + rect.height / 2;
      const distance = Math.abs(clientY - blockCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBlock = block as HTMLElement;
        dropZone = clientY < blockCenter ? 'above' : 'below';
      }
    });
    
    if (closestBlock) {
      const rect = closestBlock.getBoundingClientRect();
      const indicatorTop = dropZone === 'above' ? rect.top - 2 : rect.bottom - 2;
      
      setDropIndicator({
        visible: true,
        top: indicatorTop,
        left: editorRect.left + 20,
        width: editorRect.width - 40,
      });
      
      // Find the position in the document
      const pos = editor.view.posAtDOM(closestBlock, 0);
      if (pos !== null) {
        const blockInfo = findBlockAtPos(pos);
        if (blockInfo) {
          setDragState(prev => ({
            ...prev,
            dropZone,
            targetPos: dropZone === 'above' ? blockInfo.pos : blockInfo.pos + blockInfo.node.nodeSize,
          }));
        }
      }
    } else {
      setDropIndicator(prev => ({ ...prev, visible: false }));
    }
  }, [editor, findBlockAtPos]);

  // Handle drag start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    const pos = editor.view.posAtCoords({ left: clientX, top: clientY });
    if (!pos) return false;
    
    const blockInfo = findBlockAtPos(pos.pos);
    if (!blockInfo) return false;
    
    const domElement = getDOMElementForPos(blockInfo.pos);
    if (!domElement) return false;
    
    // Create ghost element
    const ghost = createGhostElement(domElement);
    setGhostElement(ghost);
    
    // Update drag state
    setDragState({
      isDragging: true,
      draggedNode: blockInfo.node,
      draggedPos: blockInfo.pos,
      startY: clientY,
      currentY: clientY,
      dropZone: null,
      targetPos: -1,
    });
    
    // Add visual feedback to original element
    domElement.style.opacity = '0.3';
    
    longPressFeedback();
    return true;
  }, [editor, findBlockAtPos, getDOMElementForPos, createGhostElement, longPressFeedback]);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging) return;
    
    updateGhostPosition(clientX, clientY);
    updateDropIndicator(clientY);
    
    setDragState(prev => ({ ...prev, currentY: clientY }));
  }, [dragState.isDragging, updateGhostPosition, updateDropIndicator]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;
    
    // Clean up ghost element
    if (ghostElement) {
      document.body.removeChild(ghostElement);
      setGhostElement(null);
    }
    
    // Restore original element opacity
    const domElement = getDOMElementForPos(dragState.draggedPos);
    if (domElement) {
      domElement.style.opacity = '';
    }
    
    // Perform the move if we have a valid target
    if (dragState.targetPos !== -1 && dragState.targetPos !== dragState.draggedPos) {
      try {
        const { state, dispatch } = editor.view;
        const tr = state.tr;
        
        // Cut the dragged node
        const draggedNode = dragState.draggedNode;
        const from = dragState.draggedPos;
        const to = from + draggedNode.nodeSize;
        
        tr.delete(from, to);
        
        // Calculate new insertion position (adjust for deletion)
        let insertPos = dragState.targetPos;
        if (insertPos > from) {
          insertPos -= draggedNode.nodeSize;
        }
        
        // Insert at new position
        tr.insert(insertPos, draggedNode);
        
        dispatch(tr);
        successFeedback();
      } catch (error) {
        console.warn('Failed to move block:', error);
        errorFeedback();
      }
    }
    
    // Reset state
    setDragState({
      isDragging: false,
      draggedNode: null,
      draggedPos: -1,
      startY: 0,
      currentY: 0,
      dropZone: null,
      targetPos: -1,
    });
    setDropIndicator(prev => ({ ...prev, visible: false }));
  }, [dragState, ghostElement, getDOMElementForPos, editor, successFeedback, errorFeedback]);

  // Set up touch gestures
  const { attachToElement } = useTouchGestures({
    onLongPress: (event) => {
      const touch = event.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    },
  });

  // Handle touch move and end for dragging
  useEffect(() => {
    if (!dragState.isDragging) return;
    
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touch = event.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      handleDragEnd();
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Attach touch gestures to editor
  useEffect(() => {
    const editorElement = editor.view.dom as HTMLElement;
    attachToElement(editorElement);
  }, [editor, attachToElement]);

  return (
    <div ref={containerRef} className={cn('mobile-drag-drop', className)}>
      {/* Drop indicator */}
      {dropIndicator.visible && (
        <div
          className="fixed z-30 h-1 bg-primary rounded-full shadow-lg animate-pulse"
          style={{
            top: dropIndicator.top,
            left: dropIndicator.left,
            width: dropIndicator.width,
          }}
        />
      )}
      
      {/* Drag overlay */}
      {dragState.isDragging && (
        <div className="fixed inset-0 z-20 bg-background/20 backdrop-blur-sm" />
      )}
    </div>
  );
}
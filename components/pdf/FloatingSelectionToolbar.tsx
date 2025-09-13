/**
 * Floating Selection Toolbar Component
 *
 * This component provides a floating toolbar for text selection in the PDF viewer.
 */
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { StickyNote, X } from 'lucide-react';

interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FloatingSelectionToolbarProps {
  isVisible: boolean;
  bounds: SelectionBounds | null;
  selectedText: string;
  onCreateNote: () => void;
  onClose: () => void;
}

export const FloatingSelectionToolbar: React.FC<FloatingSelectionToolbarProps> = ({
  isVisible,
  bounds,
  selectedText,
  onCreateNote,
  onClose,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (bounds && isVisible) {
      // Calculate position above the selection with some padding
      const toolbarHeight = 48; // Approximate toolbar height
      const padding = 10;
      
      // Position above the selection
      let top = bounds.y - toolbarHeight - padding;
      let left = bounds.x + (bounds.width / 2); // Center horizontally

      // Ensure toolbar doesn't go off-screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const toolbarWidth = 200; // Approximate toolbar width

      // Adjust horizontal position
      if (left + toolbarWidth / 2 > viewportWidth - 20) {
        left = viewportWidth - toolbarWidth / 2 - 20;
      }
      if (left - toolbarWidth / 2 < 20) {
        left = toolbarWidth / 2 + 20;
      }

      // If there's not enough space above, position below
      if (top < 20) {
        top = bounds.y + bounds.height + padding;
      }

      setPosition({ top, left: left - toolbarWidth / 2 });
    }
  }, [bounds, isVisible]);

  if (!isVisible || !bounds) {
    return null;
  }

  const toolbar = (
    <div
      className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Button
        size="sm"
        onClick={onCreateNote}
        className="flex items-center gap-2 text-sm"
        variant="default"
      >
        <StickyNote size={16} />
        Create Note
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={onClose}
        className="p-1 h-8 w-8"
      >
        <X size={14} />
      </Button>
      
      {/* Small arrow pointing to selection */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
      </div>
    </div>
  );

  // Use portal to render outside of PDF viewer container
  return createPortal(toolbar, document.body);
};

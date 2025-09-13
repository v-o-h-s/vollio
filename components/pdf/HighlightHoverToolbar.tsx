/*
this component provides a floating toolbar when
 hovering over a text highlight in the PDF viewer.
*/


import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HighlightHoverToolbarProps {
  isVisible: boolean;
  position: { x: number; y: number } | null;
  noteId: string | null;
  noteTitle?: string;
  onViewNote: () => void;
}

export const HighlightHoverToolbar: React.FC<HighlightHoverToolbarProps> = ({
  isVisible,
  position,
  noteId,
  noteTitle,
  onViewNote,
}) => {
  const router = useRouter();
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (position && isVisible) {
      const toolbarWidth = 200;
      const toolbarHeight = 48;
      const padding = 10;

      let top = position.y - toolbarHeight - padding;
      let left = position.x - toolbarWidth / 2;

      // Ensure toolbar stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust horizontal position
      if (left + toolbarWidth > viewportWidth - 20) {
        left = viewportWidth - toolbarWidth - 20;
      }
      if (left < 20) {
        left = 20;
      }

      // If not enough space above, position below
      if (top < 20) {
        top = position.y + padding;
      }

      setToolbarPosition({ top, left });
    }
  }, [position, isVisible]);

  const handleOpenInNotesPage = () => {
    if (noteId) {
      router.push(`/dashboard/notes/${noteId}`);
    }
  };

  if (!isVisible || !position || !noteId) {
    return null;
  }

  const toolbar = (
    <div
      className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: toolbarPosition.top,
        left: toolbarPosition.left,
      }}
    >
      <Button
        size="sm"
        onClick={onViewNote}
        className="flex items-center gap-2 text-sm"
        variant="default"
      >
        <Eye size={16} />
        View Note
      </Button>
      
      <Button
        size="sm"
        onClick={handleOpenInNotesPage}
        className="flex items-center gap-2 text-sm"
        variant="outline"
      >
        <ExternalLink size={16} />
        Open
      </Button>

      {/* Tooltip showing note title */}
      {noteTitle && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap">
          {noteTitle}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(toolbar, document.body);
};

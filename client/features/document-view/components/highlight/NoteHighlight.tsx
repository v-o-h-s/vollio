"use client";

import { MyHighlight } from "@/features/document-view/types/highlight";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import MinimalEditor from "./MinimalEditor";
import { FileText, X } from "lucide-react";
import { CreateHighlightDTO } from "@vollio/shared";

interface NoteHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color: string;
  updateHighlight: (
    highlightId: string,
    highlight: Partial<CreateHighlightDTO>
  ) => Promise<any>;
}

const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const NoteHighlight = ({
  highlight,
  isScrolledTo,
  color,
  updateHighlight,
}: NoteHighlightProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const rects = useMemo(() => {
    const raw = highlight.position?.rects ?? [];
    return raw.map((r: any) => ({
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    }));
  }, [highlight.position?.rects]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditorOpen(!isEditorOpen);
  };

  const handleSave = async (html: string) => {
    try {
      await updateHighlight(highlight.id, {
        noteContent: html,
      });
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Failed to update note content:", error);
    }
  };

  if (!rects || rects.length === 0) return null;

  const noteColor = "#4F46E5"; // Indigo for notes

  return (
    <>
      {rects.map((rect, idx) => (
        <div
          key={`note-overlay-${idx}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          style={{
            position: "absolute",
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            backgroundColor: hexToRgba(noteColor, 0.2),
            borderBottom: `2px solid ${noteColor}`,
            cursor: "pointer",
            pointerEvents: "auto",
            zIndex: 5,
            transition: "all 0.3s ease",
          }}
        >
          {idx === 0 && (
            <div 
              className="absolute -top-6 -left-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg"
              style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
            >
              <FileText className="w-3 h-3" />
            </div>
          )}
        </div>
      ))}

      {isEditorOpen && (
        <div 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
             <button 
                onClick={() => setIsEditorOpen(false)}
                className="absolute -top-10 right-0 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors cursor-pointer"
             >
                <X className="w-5 h-5" />
             </button>
             <MinimalEditor 
                initialValue={highlight.noteContent || ""} 
                onSave={handleSave}
                className="static translate-x-0 top-0 mt-0 w-full shadow-2xl border-indigo-500/30"
                placeholder="Write your detailed note here..."
             />
          </div>
        </div>
      )}
    </>
  );
};
import React, { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Edit3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Note } from "@/lib/types";

interface NoteCardProps {
  note: Note;
  onEdit: (noteId: string) => void;
  onViewAnnotation?: (annotationId: string) => void;
}

export const NoteCard = memo<NoteCardProps>(({ note, onEdit, onViewAnnotation }) => {
  const handleCardClick = () => {
    onEdit(note.id);
  };

  const handleViewAnnotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.pdfAnnotationId && onViewAnnotation) {
      onViewAnnotation(note.pdfAnnotationId);
    }
  };

  // Extract preview text from content
  const previewText = React.useMemo(() => {
    if (!note.content?.content?.[0]?.content?.[0]?.text) {
      return "Empty note";
    }
    
    const text = note.content.content[0].content[0].text;
    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
  }, [note.content]);

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
          {note.title}
        </h3>
        {note.pdfAnnotationId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAnnotation}
            className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
            title="View PDF annotation"
          >
            <ExternalLink size={14} />
          </Button>
        )}
      </div>
      
      {/* Note content preview */}
      <div className="text-gray-600 text-sm mb-4 line-clamp-3">
        {previewText}
      </div>
      
      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>
            {formatDistanceToNow(new Date(note.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        
        {note.pdfAnnotationId && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
            Linked to PDF
          </span>
        )}
      </div>

      {/* Edit button - visible on hover */}
      <div className="mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <Edit3 size={16} />
          Edit Note
        </Button>
      </div>
    </Card>
  );
});

NoteCard.displayName = "NoteCard";
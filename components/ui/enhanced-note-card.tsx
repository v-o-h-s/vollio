import React, { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Clock, 
  FileText, 
  Star,
  MoreHorizontal,
  Trash2,
  Copy
} from "lucide-react";
import { safeFormatDistanceToNow } from "@/lib/utils/dates";
import { Note, JSONContent } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedNoteCardProps {
  note: Note;
  variant?: 'grid' | 'list' | 'compact';
  showPreview?: boolean;
  showMetadata?: boolean;
  onEdit: (noteId: string) => void;
  onViewAnnotation?: (annotationId: string) => void;
  onDelete?: (noteId: string) => void;
  onDuplicate?: (noteId: string) => void;
  onToggleStar?: (noteId: string) => void;
}

// Helper function to extract plain text from TipTap JSONContent
const extractTextFromContent = (content: JSONContent): string => {
  if (!content) return '';
  
  let text = '';
  
  if (content.text) {
    text += content.text;
  }
  
  if (content.content && Array.isArray(content.content)) {
    for (const child of content.content) {
      text += extractTextFromContent(child);
    }
  }
  
  return text;
};

// Helper function to calculate reading time (average 200 words per minute)
const calculateReadingTime = (text: string): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

// Helper function to count words
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const EnhancedNoteCard = memo<EnhancedNoteCardProps>(({ 
  note, 
  variant = 'grid',
  showPreview = true,
  showMetadata = true,
  onEdit, 
  onViewAnnotation,
  onDelete,
  onDuplicate,
  onToggleStar
}) => {
  const handleCardClick = () => {
    onEdit(note.id);
  };

  const handleViewAnnotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.pdfAnnotationId && onViewAnnotation) {
      onViewAnnotation(note.pdfAnnotationId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(note.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(note.id);
    }
  };

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleStar) {
      onToggleStar(note.id);
    }
  };

  // Extract and process note content
  const { previewText, wordCount, readingTime } = useMemo(() => {
    const fullText = extractTextFromContent(note.content);
    const words = countWords(fullText);
    const reading = calculateReadingTime(fullText);
    
    let preview = '';
    if (fullText.length > 0) {
      preview = fullText.length > 150 ? `${fullText.substring(0, 150)}...` : fullText;
    } else {
      preview = "Empty note";
    }
    
    return {
      previewText: preview,
      wordCount: words,
      readingTime: reading
    };
  }, [note.content]);

  // Determine card classes based on variant
  const cardClasses = useMemo(() => {
    const baseClasses = "enhanced-note-card group cursor-pointer transition-all duration-normal hover-lift";
    
    switch (variant) {
      case 'list':
        return `${baseClasses} p-5 hover:shadow-lg border-l-4 border-l-transparent hover:border-l-primary`;
      case 'compact':
        return `${baseClasses} p-4 hover:shadow-md`;
      default: // grid
        return `${baseClasses} p-6 hover:shadow-xl`;
    }
  }, [variant]);

  const titleClasses = useMemo(() => {
    const baseClasses = "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2";
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} text-sm leading-tight`;
      case 'list':
        return `${baseClasses} text-lg leading-snug`;
      default: // grid
        return `${baseClasses} text-xl leading-tight`;
    }
  }, [variant]);

  const previewClasses = useMemo(() => {
    const baseClasses = "text-muted-foreground leading-relaxed";
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} line-clamp-2 text-xs`;
      case 'list':
        return `${baseClasses} line-clamp-2 text-sm`;
      default: // grid
        return `${baseClasses} line-clamp-3 text-sm`;
    }
  }, [variant]);

  if (variant === 'list') {
    return (
      <Card className={cardClasses} onClick={handleCardClick}>
        <div className="flex items-start gap-4">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and actions */}
            <div className="flex items-start justify-between">
              <h3 className={titleClasses}>
                {note.title || "Untitled Note"}
              </h3>
              <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Star button */}
                {onToggleStar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleStar}
                    className="h-8 w-8 p-0 hover:bg-accent"
                    title="Star note"
                  >
                    <Star size={14} className="text-muted-foreground hover:text-warning" />
                  </Button>
                )}
                
                {/* PDF annotation link */}
                {note.pdfAnnotationId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAnnotation}
                    className="h-8 w-8 p-0 hover:bg-accent"
                    title="View PDF annotation"
                  >
                    <ExternalLink size={14} className="text-muted-foreground hover:text-primary" />
                  </Button>
                )}
                
                {/* More actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={14} className="text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCardClick}>
                      <Edit3 size={14} className="mr-2" />
                      Edit Note
                    </DropdownMenuItem>
                    {onDuplicate && (
                      <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy size={14} className="mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Preview text */}
            {showPreview && (
              <div className={previewClasses}>
                {previewText}
              </div>
            )}
            
            {/* Metadata */}
            {showMetadata && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      {safeFormatDistanceToNow(note.updatedAt || note.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={12} />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{readingTime} min read</span>
                  </div>
                </div>
                
                {/* PDF annotation badge */}
                {note.pdfAnnotationId && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    Linked to PDF
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cardClasses} onClick={handleCardClick}>
      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={titleClasses}>
            {note.title || "Untitled Note"}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Star button */}
          {onToggleStar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleStar}
              className="h-8 w-8 p-0 hover:bg-accent"
              title="Star note"
            >
              <Star size={14} className="text-muted-foreground hover:text-warning" />
            </Button>
          )}
          
          {/* PDF annotation link */}
          {note.pdfAnnotationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAnnotation}
              className="h-8 w-8 p-0 hover:bg-accent"
              title="View PDF annotation"
            >
              <ExternalLink size={14} className="text-muted-foreground hover:text-primary" />
            </Button>
          )}
          
          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={14} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCardClick}>
                <Edit3 size={14} className="mr-2" />
                Edit Note
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy size={14} className="mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Note content preview */}
      {showPreview && variant !== 'compact' && (
        <div className={`${previewClasses} mb-4`}>
          {previewText}
        </div>
      )}
      
      {/* Metadata section */}
      {showMetadata && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {/* Last updated */}
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>
                {safeFormatDistanceToNow(note.updatedAt || note.updatedAt)}
              </span>
            </div>
            
            {/* Word count */}
            {variant !== 'compact' && (
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span>{wordCount} words</span>
              </div>
            )}
            
            {/* Reading time */}
            {variant === 'grid' && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{readingTime} min read</span>
              </div>
            )}
          </div>
          
          {/* PDF annotation badge */}
          {note.pdfAnnotationId && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              Linked to PDF
            </span>
          )}
        </div>
      )}

      {/* Quick edit button - visible on hover */}
      {variant === 'grid' && (
        <div className="mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/5"
            onClick={handleCardClick}
          >
            <Edit3 size={16} />
            Edit Note
          </Button>
        </div>
      )}
    </Card>
  );
});

EnhancedNoteCard.displayName = "EnhancedNoteCard";
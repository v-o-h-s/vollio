import React, { useState, useMemo, useEffect } from "react";
import { Note } from "@/lib/types";
import { EnhancedNoteCard } from "./enhanced-note-card";
import { Button } from "./button";
import { Input } from "./input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  LayoutGrid,
  Calendar,
  FileText,
  Clock,
  Filter,
  Plus,
  BookOpen,
  PenTool,
  Star,
  Link,
  X
} from "lucide-react";

interface NotesListLayoutProps {
  notes: Note[];
  viewMode?: 'grid' | 'list' | 'compact';
  sortBy?: 'updated' | 'created' | 'title' | 'wordCount';
  sortOrder?: 'asc' | 'desc';
  filterBy?: string;
  onCreateNote: () => void;
  onEditNote: (id: string) => void;
  onViewAnnotation?: (annotationId: string) => void;
  onDeleteNote?: (id: string) => void;
  onDuplicateNote?: (id: string) => void;
  onToggleStarNote?: (id: string) => void;
  onViewModeChange?: (mode: 'grid' | 'list' | 'compact') => void;
  onSortChange?: (sortBy: 'updated' | 'created' | 'title' | 'wordCount', sortOrder: 'asc' | 'desc') => void;
  onFilterChange?: (filter: string) => void;
}

// Helper function to extract text from JSONContent for sorting/filtering
const extractTextFromContent = (content: any): string => {
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

// Helper function to count words
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const EnhancedNotesList: React.FC<NotesListLayoutProps> = ({
  notes,
  viewMode = 'grid',
  sortBy = 'updated',
  sortOrder = 'desc',
  filterBy = '',
  onCreateNote,
  onEditNote,
  onViewAnnotation,
  onDeleteNote,
  onDuplicateNote,
  onToggleStarNote,
  onViewModeChange,
  onSortChange,
  onFilterChange
}) => {
  const isMobile = useIsMobile();
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const [currentSortOrder, setCurrentSortOrder] = useState(sortOrder);
  const [searchQuery, setSearchQuery] = useState(filterBy);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setCurrentViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    setCurrentSortBy(sortBy);
  }, [sortBy]);

  useEffect(() => {
    setCurrentSortOrder(sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    setSearchQuery(filterBy);
  }, [filterBy]);

  // Process and filter notes
  const processedNotes = useMemo(() => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => {
        const title = (note.title || '').toLowerCase();
        const content = extractTextFromContent(note.content).toLowerCase();
        return title.includes(query) || content.includes(query);
      });
    }

    // Apply additional filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(note => {
        return activeFilters.every(filter => {
          switch (filter) {
            case 'linked':
              return note.pdfAnnotationId;
            case 'recent':
              const dayAgo = new Date();
              dayAgo.setDate(dayAgo.getDate() - 1);
              return new Date(note.updatedAt) > dayAgo;
            case 'long':
              const wordCount = countWords(extractTextFromContent(note.content));
              return wordCount > 500;
            case 'empty':
              const content = extractTextFromContent(note.content);
              return content.trim().length === 0;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (currentSortBy) {
        case 'title':
          comparison = (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'wordCount':
          const aWords = countWords(extractTextFromContent(a.content));
          const bWords = countWords(extractTextFromContent(b.content));
          comparison = aWords - bWords;
          break;
        case 'updated':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return currentSortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [notes, searchQuery, currentSortBy, currentSortOrder]);

  // Enhanced responsive grid layout classes based on view mode with improved adaptive columns
  const gridClasses = useMemo(() => {
    switch (currentViewMode) {
      case 'list':
        return 'grid gap-4 grid-cols-1';
      case 'compact':
        return 'grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7';
      default: // grid
        return 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6';
    }
  }, [currentViewMode]);

  const handleSortChange = (newSortBy: typeof currentSortBy) => {
    const newSortOrder = newSortBy === currentSortBy 
      ? (currentSortOrder === 'asc' ? 'desc' : 'asc')
      : 'desc';
    
    setCurrentSortBy(newSortBy);
    setCurrentSortOrder(newSortOrder);
    
    // Notify parent component
    if (onSortChange) {
      onSortChange(newSortBy, newSortOrder);
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'list' | 'compact') => {
    setCurrentViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (onFilterChange) {
      onFilterChange(query);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    handleSearchChange('');
  };

  return (
    <div className="space-y-6">
      {/* Header with search and controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="h-8 w-8 p-0"
              title="Grid view"
            >
              <Grid3X3 size={16} />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="h-8 w-8 p-0"
              title="List view"
            >
              <List size={16} />
            </Button>
            <Button
              variant={currentViewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('compact')}
              className="h-8 w-8 p-0"
              title="Compact view"
            >
              <LayoutGrid size={16} />
            </Button>
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-2 ${activeFilters.length > 0 ? 'bg-primary/10 border-primary' : ''}`}
              >
                <Filter size={16} />
                Filter
                {activeFilters.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => toggleFilter('linked')}>
                <Link size={16} className="mr-2" />
                Linked to PDFs
                {activeFilters.includes('linked') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFilter('empty')}>
                <FileText size={16} className="mr-2" />
                Empty Notes
                {activeFilters.includes('empty') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFilter('recent')}>
                <Clock size={16} className="mr-2" />
                Recent (24h)
                {activeFilters.includes('recent') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFilter('long')}>
                <FileText size={16} className="mr-2" />
                Long Notes (500+ words)
                {activeFilters.includes('long') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              {activeFilters.length > 0 && (
                <>
                  <div className="border-t my-1" />
                  <DropdownMenuItem onClick={clearAllFilters}>
                    <X size={16} className="mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                {currentSortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleSortChange('updated')}>
                <Calendar size={16} className="mr-2" />
                Last Updated
                {currentSortBy === 'updated' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currentSortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('created')}>
                <Calendar size={16} className="mr-2" />
                Date Created
                {currentSortBy === 'created' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currentSortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('title')}>
                <FileText size={16} className="mr-2" />
                Title
                {currentSortBy === 'title' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currentSortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('wordCount')}>
                <Clock size={16} className="mr-2" />
                Word Count
                {currentSortBy === 'wordCount' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currentSortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {processedNotes.length} {processedNotes.length === 1 ? 'note' : 'notes'}
            {searchQuery && ` matching "${searchQuery}"`}
            {activeFilters.length > 0 && ` with ${activeFilters.length} filter${activeFilters.length === 1 ? '' : 's'}`}
          </span>
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-1">
              {activeFilters.map(filter => (
                <span 
                  key={filter}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {filter === 'linked' && <Link size={10} />}
                  {filter === 'empty' && <FileText size={10} />}
                  {filter === 'recent' && <Clock size={10} />}
                  {filter === 'long' && <FileText size={10} />}
                  {filter}
                  <button
                    onClick={() => toggleFilter(filter)}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={8} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        {(searchQuery || activeFilters.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Notes grid with staggered animations */}
      {processedNotes.length > 0 ? (
        <div className={`${gridClasses} notes-grid`}>
          {processedNotes.map((note, index) => (
            <div 
              key={note.id}
              className="notes-grid-item"
              style={{ 
                animationDelay: `${Math.min(index * 50, 400)}ms` 
              }}
            >
              <EnhancedNoteCard
                note={note}
                variant={currentViewMode}
                showPreview={currentViewMode !== 'compact'}
                showMetadata={true}
                onEdit={onEditNote}
                onViewAnnotation={onViewAnnotation}
                onDelete={onDeleteNote}
                onDuplicate={onDuplicateNote}
                onToggleStar={onToggleStarNote}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          {searchQuery ? (
            // Search empty state
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                No notes found
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                No notes match your search for <span className="font-medium text-foreground">"{searchQuery}"</span>. 
                Try adjusting your search terms or browse all notes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => handleSearchChange('')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText size={16} />
                  Show All Notes
                </Button>
                <Button 
                  onClick={onCreateNote}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create New Note
                </Button>
              </div>
            </div>
          ) : (
            // Default empty state
            <div className="max-w-lg mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <FileText size={40} className="text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Plus size={16} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Start your note-taking journey
              </h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Create rich, interactive notes with our powerful editor. Link them to PDF annotations, 
                organize your thoughts, and build your knowledge base. Get started with your first note!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={onCreateNote}
                  size="lg"
                  className="flex items-center gap-2 px-8 py-4 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-normal hover-lift"
                >
                  <FileText size={18} />
                  Create your first note
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 px-8 py-4 text-base"
                  onClick={() => {
                    // TODO: Add link to help or demo
                    console.log('Show help or demo');
                  }}
                >
                  <BookOpen size={18} />
                  Learn more
                </Button>
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <PenTool size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-foreground">Rich Editor</h4>
                  <p className="text-sm text-muted-foreground">
                    Format text, add links, and create structured content
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <FileText size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-foreground">PDF Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Link notes directly to PDF annotations and highlights
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Search size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-foreground">Smart Search</h4>
                  <p className="text-sm text-muted-foreground">
                    Find notes quickly with powerful search and filtering
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
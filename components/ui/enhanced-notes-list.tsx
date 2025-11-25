import React, { useState, useMemo, useEffect } from "react";
import { Note } from "@/lib/types/editor";
import { EnhancedNoteCard } from "./enhanced-note-card";
import { Button } from "./button";
import { Input } from "./input";
// Responsive design handled via CSS
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
  // Responsive design handled via CSS
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
              const noteDate = note.updatedAt || note.updatedAt;
              if (!noteDate) return false;
              try {
                return new Date(noteDate) > dayAgo;
              } catch {
                return false;
              }
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
          const aCreated = a.createdAt || a.createdAt;
          const bCreated = b.createdAt || b.createdAt;
          try {
            comparison = new Date(aCreated || 0).getTime() - new Date(bCreated || 0).getTime();
          } catch {
            comparison = 0;
          }
          break;
        case 'wordCount':
          const aWords = countWords(extractTextFromContent(a.content));
          const bWords = countWords(extractTextFromContent(b.content));
          comparison = aWords - bWords;
          break;
        case 'updated':
        default:
          const aUpdated = a.updatedAt || a.updatedAt;
          const bUpdated = b.updatedAt || b.updatedAt;
          try {
            comparison = new Date(aUpdated || 0).getTime() - new Date(bUpdated || 0).getTime();
          } catch {
            comparison = 0;
          }
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
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60" 
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-border/30 rounded-lg focus:ring-2 focus:ring-ring/40 focus:border-ring/40 focus:bg-card/20 text-sm placeholder:text-muted-foreground/50 transition-all duration-200 hover:border-border/50"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-card/40 backdrop-blur-sm rounded-lg p-1 border border-border/30">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                currentViewMode === 'grid'
                  ? "bg-background/70 text-foreground shadow-sm border border-border/30"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-background/30"
              }`}
              title="Grid view"
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                currentViewMode === 'list'
                  ? "bg-background/70 text-foreground shadow-sm border border-border/30"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-background/30"
              }`}
              title="List view"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => handleViewModeChange('compact')}
              className={`p-2 rounded-md transition-all duration-200 ${
                currentViewMode === 'compact'
                  ? "bg-background/70 text-foreground shadow-sm border border-border/30"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-background/30"
              }`}
              title="Compact view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`flex items-center gap-2 h-9 px-3 border-border/30 hover:border-border/50 hover:bg-card/40 backdrop-blur-sm rounded-lg ${
                  activeFilters.length > 0 ? 'border-primary/50 bg-primary/10 text-primary' : ''
                }`}
              >
                <Filter size={14} />
                <span className="hidden sm:inline">Filter</span>
                {activeFilters.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-border/50 rounded-xl shadow-xl">
              <DropdownMenuItem onClick={() => toggleFilter('linked')} className="hover:bg-accent/30 rounded-lg">
                <Link size={14} className="mr-2" />
                Linked to PDFs
                {activeFilters.includes('linked') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFilter('empty')} className="hover:bg-accent/30 rounded-lg">
                <FileText size={14} className="mr-2" />
                Empty Notes
                {activeFilters.includes('empty') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFilter('recent')} className="hover:bg-accent/30 rounded-lg">
                <Clock size={14} className="mr-2" />
                Recent (24h)
                {activeFilters.includes('recent') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFilter('long')} className="hover:bg-accent/30 rounded-lg">
                <FileText size={14} className="mr-2" />
                Long Notes (500+ words)
                {activeFilters.includes('long') && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </DropdownMenuItem>
              {activeFilters.length > 0 && (
                <>
                  <div className="border-t my-1" />
                  <DropdownMenuItem onClick={clearAllFilters} className="hover:bg-accent/30 rounded-lg">
                    <X size={14} className="mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 h-9 px-3 border-border/30 hover:border-border/50 hover:bg-card/40 backdrop-blur-sm rounded-lg"
              >
                {currentSortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-border/50 rounded-xl shadow-xl">
              <DropdownMenuItem onClick={() => handleSortChange('updated')} className="hover:bg-accent/30 rounded-lg">
                <Calendar size={14} className="mr-2" />
                Last Updated
                {currentSortBy === 'updated' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currentSortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('created')} className="hover:bg-accent/30 rounded-lg">
                <Calendar size={14} className="mr-2" />
                Date Created
                {currentSortBy === 'created' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currentSortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('title')} className="hover:bg-accent/30 rounded-lg">
                <FileText size={14} className="mr-2" />
                Title
                {currentSortBy === 'title' && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {currentSortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('wordCount')} className="hover:bg-accent/30 rounded-lg">
                <Clock size={14} className="mr-2" />
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
                  className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-primary text-primary-foreground"
                >
                  {filter === 'linked' && <Link size={10} />}
                  {filter === 'empty' && <FileText size={10} />}
                  {filter === 'recent' && <Clock size={10} />}
                  {filter === 'long' && <FileText size={10} />}
                  {filter}
                  <button
                    onClick={() => toggleFilter(filter)}
                    className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
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
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
                  className="flex items-center gap-2 px-8 py-4 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-normal hover-lift bg-primary text-primary-foreground hover:bg-primary/90"
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
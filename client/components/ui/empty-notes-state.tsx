"use client";

import { Plus, StickyNote } from "lucide-react";
import { Button } from "./button";

interface EmptyNotesStateProps {
  onCreateNote: () => void;
  isSearch?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
}

/**
 * Simplified Empty State for Notes
 */
export function EmptyNotesState({
  onCreateNote,
  isSearch = false,
  searchQuery = "",
  onClearSearch,
}: EmptyNotesStateProps) {
  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4 border border-border/50">
          <StickyNote className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No results for "{searchQuery}"
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClearSearch}>
            Clear Search
          </Button>
          <Button onClick={onCreateNote}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-6 border border-border/50">
        <StickyNote className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <div className="space-y-2 mb-8">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          No notes yet
        </h3>
        <p className="text-muted-foreground max-w-[280px] mx-auto text-sm leading-relaxed">
          Your thoughts and document insights will appear here. Start your
          knowledge journey with a new note.
        </p>
      </div>
      <Button
        onClick={onCreateNote}
        size="lg"
        className="rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create First Note
      </Button>
    </div>
  );
}

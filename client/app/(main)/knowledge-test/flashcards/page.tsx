"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, BrainCircuit } from "lucide-react";
import { useFlashcards } from "@/features/knowldge-test/flashcards/hooks/useFlashcards";
import { FlashcardCard } from "@/features/knowldge-test/flashcards/components/FlashcardCard";

export default function FlashcardsListPage() {
  const { flashcardSets, isLoading, deleteFlashcardSet } = useFlashcards();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading flashcard decks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
            Flashcards
          </h1>
          <p className="text-muted-foreground mt-1">
            Review your knowledge with spaced repetition
          </p>
        </div>
        <Link href="/knowledge-test/flashcards/create">
          <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Create New Deck
          </Button>
        </Link>
      </div>

      {flashcardSets && flashcardSets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => (
            <FlashcardCard
              key={set.id}
              set={set}
              onDelete={deleteFlashcardSet}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/30 rounded-3xl border border-dashed border-border">
          <div className="p-6 rounded-full bg-pink-100 dark:bg-pink-900/20 mb-6 animate-pulse">
            <BrainCircuit className="w-12 h-12 text-pink-600 dark:text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No flashcard decks yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Create your first deck manually or let our AI generate one for you
            from your notes.
          </p>
          <Link href="/knowledge-test/flashcards/create">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xl hover:-translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Flashcard Deck
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

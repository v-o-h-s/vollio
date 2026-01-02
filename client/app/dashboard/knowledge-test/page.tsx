/**
 * Knowledge Test Page
 *
 * @returns {JSX.Element}
 */
"use client";
import { useState, useMemo } from "react";
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Brain, Layers, Sparkles } from "lucide-react";
import { Sidebar } from "@/features/knowldge-test/sidebar/components/Sidebar";
import { QuizCard } from "@/features/knowldge-test/quizzes/components/QuizCard";
import { FlashcardCard } from "@/features/knowldge-test/flashcards/components/FlashcardCard";
import { cn } from "@/lib/utils";

type Section = "quizzes" | "flashcards";

import {
  useGetAllQuizzesQuery,
  useDeleteQuizMutation,
  useGetAllDocumentsQuery,
  useGetAllFlashCardsSetsQuery,
  useDeleteFlashCardsSetMutation,
} from "@/lib/store/apiSlice";

export default function KnowledgeTestPage() {
  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes,
  } = useGetAllQuizzesQuery();
  const { data: documentsData, refetch: refetchDocuments } =
    useGetAllDocumentsQuery();
  const [deleteQuiz] = useDeleteQuizMutation();

  const {
    data: flashcardsData,
    isLoading: isLoadingFlashcards,
    refetch: refetchFlashcards,
  } = useGetAllFlashCardsSetsQuery();
  const [deleteFlashcardSet] = useDeleteFlashCardsSetMutation();

  const [section, setSection] = useState<Section>("quizzes");

  const [query, setQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  // memorizing all documents (like for performance and we only register id and name,
  // basically what we need in this page)
  const documentsMap = useMemo(() => {
    const map = new Map<string, string>();
    documentsData?.forEach((document) =>
      map.set(document.id, document.name)
    );
    // Also add documents from flashcards if they are not in the document list (unlikely but possible if deleted)
    flashcardsData?.forEach((f) => {
      if (f.documentId && !map.has(f.documentId)) {
        // We don't have the name if it's not in documentsData, maybe "Unknown" or just skip
      }
    });

    return map;
  }, [documentsData, flashcardsData]);

  // Map API response to UI model
  const mappedFlashcards = useMemo(() => {
    if (!flashcardsData) return [];
    return flashcardsData.map((set) => ({
      id: set.id,
      title: set.name,
      cards: set.flashCards?.length || 0,
      category: set.language || "General",
      documentName: documentsMap.get(set.documentId) || "Unknown Document",
      createdAt: set.createdAt,
      mastery: 0,
      documentId: set.documentId,
    }));
  }, [flashcardsData, documentsMap]);

  // Apply filters for Flashcards
  const filteredFlashcards = useMemo(() => {
    return mappedFlashcards.filter((f) => {
      const matchesQuery = (f.title || "")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesDocument =
        selectedDocument === "all" || f.documentName === selectedDocument; // Note: Sidebar uses documentName value for options

      // Reusing category as language/category filter
      // Adjust if logic for category/language distinction becomes stricter
      const matchesLanguage =
        selectedLanguage === "all" || f.category === selectedLanguage;

      return matchesQuery && matchesDocument && matchesLanguage;
    });
  }, [mappedFlashcards, query, selectedDocument, selectedLanguage]);

  // Apply filters for Quizzes
  const filteredQuizzes = useMemo(() => {
    return (quizzesData || []).filter((q) => {
      const matchesQuery = (q.title || "")
        .toLowerCase()
        .includes(query.toLowerCase());

      const name = documentsMap.get(q.documentId);
      const matchesDocument =
        selectedDocument === "all" || name === selectedDocument;

      const matchesDifficulty =
        selectedDifficulty === "all" ||
        q.settings.difficultyLevel?.toLowerCase() ===
          selectedDifficulty.toLowerCase();

      const matchesLanguage =
        selectedLanguage === "all" || q.language === selectedLanguage;

      return (
        matchesQuery && matchesDocument && matchesDifficulty && matchesLanguage
      );
    });
  }, [
    quizzesData,
    query,
    selectedDocument,
    selectedDifficulty,
    selectedLanguage,
    documentsMap,
  ]);

  return (
    <div className="space-y-8 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl shadow-sm transition-all duration-500",
                section === "quizzes" 
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                  : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
              )}
            >
              {section === "quizzes" ? (
                <Brain className="w-6 h-6" />
              ) : (
                <Layers className="w-6 h-6" />
              )}
            </div>
            {section === "quizzes" ? "Knowledge Quizzes" : "Flashcard Decks"}
          </h1>
          <p className="text-muted-foreground mt-2 md:ml-14 max-w-2xl">
            {section === "quizzes"
              ? "Test your understanding with AI-generated quizzes based on your documents."
              : "Master topics through spaced repetition and active recall flashcards."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={
              section === "quizzes"
                ? "/dashboard/knowledge-test/quizzes/create"
                : "/dashboard/knowledge-test/flashcards/create"
            }
          >
            <Button
              className={cn(
                "shadow-lg hover:shadow-xl transition-all duration-300 font-bold border-none h-11 px-6",
                section === "quizzes"
                  ? "bg-indigo-600 hover:bg-indigo-500"
                  : "bg-rose-500 hover:bg-rose-400"
              )}
            >
              <Plus className="w-4 h-4 mr-2" />
              {section === "quizzes" ? "New Quiz" : "New Deck"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Filters */}
        <Sidebar
          section={section}
          setSection={setSection}
          query={query}
          setQuery={setQuery}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          documentsMap={documentsMap}
          quizzesData={quizzesData || []} 
          flashcards={mappedFlashcards} 
        />

        {/* Main Content Grid */}
        <main className="col-span-1 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <Link
              href={
                section === "quizzes"
                  ? "/dashboard/knowledge-test/quizzes/create"
                  : "/dashboard/knowledge-test/flashcards/create"
              }
              className="h-full"
            >
              <Card className="h-full border-2 border-dashed border-border/60 bg-muted/5 hover:bg-accent/5 hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[240px] group relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className={cn(
                    "p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm",
                    section === "quizzes"
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg mb-1 relative z-10">Create New</h3>
                <p className="text-sm text-muted-foreground text-center max-w-[200px] relative z-10">
                  {section === "quizzes"
                    ? "Generate a tailored quiz from your notes"
                    : "Build a new flashcard deck for study"}
                </p>
              </Card>
            </Link>

            {/* Quiz Cards */}
            {section === "quizzes" && isLoadingQuizzes && (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground animate-pulse">Loading quizzes...</p>
              </div>
            )}
            {section === "quizzes" &&
              !isLoadingQuizzes &&
              filteredQuizzes.map((q) => (
                <QuizCard key={q.id} q={q} onDelete={(id) => deleteQuiz(id)} />
              ))}

            {/* Flashcard Cards */}
            {section === "flashcards" && isLoadingFlashcards && (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground animate-pulse">Loading decks...</p>
              </div>
            )}
            {section === "flashcards" &&
              !isLoadingFlashcards &&
              filteredFlashcards?.map((f) => (
                <FlashcardCard
                  key={f.id}
                  f={f}
                  onDelete={(id) => deleteFlashcardSet(id)}
                />
              ))}

            {/* Empty States */}
            {section === "quizzes" && quizzesData?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-2xl border-dashed bg-muted/10">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <Brain className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  You haven't created any quizzes yet. Generate one from your documents to start testing your knowledge.
                </p>
                <Link href="/dashboard/knowledge-test/quizzes/create">
                    <Button>Create Your First Quiz</Button>
                </Link>
              </div>
            )}
            
            {section === "quizzes" && quizzesData && quizzesData.length > 0 && filteredQuizzes.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-2xl border-dashed bg-muted/10">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                        setQuery("");
                        setSelectedDocument("all");
                        setSelectedDifficulty("all");
                        setSelectedLanguage("all");
                    }}
                >
                    Clear Filters
                </Button>
              </div> 
            )}

            {section === "flashcards" &&
              !isLoadingFlashcards &&
              filteredFlashcards?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-2xl border-dashed bg-muted/10">
                  <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <Layers className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No flashcards found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Create a new deck to get started studying or adjust your filters.
                  </p>
                  <Link href="/dashboard/knowledge-test/flashcards/create">
                    <Button variant="secondary">Create New Deck</Button>
                  </Link>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

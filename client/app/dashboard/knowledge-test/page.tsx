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
import { Plus, Brain, Layers } from "lucide-react";
import { Sidebar } from "@/features/knowldge-test/sidebar/components/Sidebar";
import { QuizCard } from "@/features/knowldge-test/quizzes/components/QuizCard";
import { FlashcardCard } from "@/features/knowldge-test/flashcards/components/FlashcardCard";

type Section = "quizzes" | "flashcards";

import {
  useGetAllQuizzesQuery,
  useDeleteQuizMutation,
  useGetAllFilesQuery,
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
    useGetAllFilesQuery();
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

  // memorizing all documents (like for performance and we only register id and filename,
  // basically what we need in this page)
  const documentsMap = useMemo(() => {
    const map = new Map<string, string>();
    documentsData?.forEach((document) =>
      map.set(document.id, document.filename)
    );
    // Also add documents from flashcards if they are not in the file list (unlikely but possible if deleted)
    flashcardsData?.forEach((f) => {
      if (f.documentId && !map.has(f.documentId)) {
        // We don't have the filename if it's not in documentsData, maybe "Unknown" or just skip
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

      const filename = documentsMap.get(q.fileId);
      const matchesDocument =
        selectedDocument === "all" || filename === selectedDocument;

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
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div
              className={`p-2 rounded-xl dark:bg-card/70 shadow-sm hover:shadow-md transition-all duration-500 ${
                section === "quizzes" ? "text-indigo-500" : "text-rose-500"
              } transition-colors duration-500`}
            >
              {section === "quizzes" ? (
                <Brain className="w-6 h-6" />
              ) : (
                <Layers className="w-6 h-6" />
              )}
            </div>
            {section === "quizzes" ? "Knowledge Quizzes" : "Flashcard Decks"}
          </h1>
          <p className="text-muted-foreground mt-1 ml-14">
            {section === "quizzes"
              ? "Test your understanding with AI-generated quizzes."
              : "Master topics through spaced repetition and active recall."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={
              section === "quizzes"
                ? "/dashboard/knowledge-test/quizzes/create"
                : "/dashboard/knowledge-test/flashcards/create"
            }
          >
            <Button
              className={`${
                section === "quizzes"
                  ? " bg-indigo-600 hover:bg-indigo-500 "
                  : "bg-rose-500 hover:bg-rose-400"
              } text-white shadow-lg hover:shadow-xl transition-all duration-300  font-medium border-none cursor-pointer`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {section === "quizzes" ? "Create New Quiz" : "Create New Deck"}
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
          quizzesData={quizzesData || []} // Pass raw data for available documents calculation
          flashcards={mappedFlashcards} // Pass raw mapped data for available documents calculation

          // Pass counts if needed, but Sidebar calculates filtering internally currently.
          // We will update Sidebar to use these props.
        />

        {/* Main Content Grid */}
        <main className="col-span-1 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card (Placeholder for quick access) */}
            <Link
              href={
                section === "quizzes"
                  ? "/dashboard/knowledge-test/quizzes/create"
                  : "/dashboard/knowledge-test/flashcards/create"
              }
            >
              <Card className="h-full border-2 border-dashed border-muted-foreground/20 bg-muted/5 hover:bg-muted/10 hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center p-6 min-h-[220px] group">
                <div
                  className={`p-4 rounded-full mb-4 group-hover:scale-110 transition-transform ${
                    section === "quizzes"
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-900/20"
                  }`}
                >
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="font-medium text-lg">Create New</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {section === "quizzes"
                    ? "Generate a new quiz from your notes"
                    : "Build a new flashcard deck"}
                </p>
              </Card>
            </Link>

            {/* Quiz Cards */}
            {section === "quizzes" && isLoadingQuizzes && (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {section === "quizzes" &&
              !isLoadingQuizzes &&
              filteredQuizzes.map((q) => (
                <QuizCard key={q.id} q={q} onDelete={(id) => deleteQuiz(id)} />
              ))}

            {/* Flashcard Cards */}
            {section === "flashcards" && isLoadingFlashcards && (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/30">
                <Brain className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No quizzes found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Try adjusting your filters or create a new quiz to get started
                  playing.
                </p>
              </div>
            )}
            {section === "flashcards" &&
              !isLoadingFlashcards &&
              filteredFlashcards?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/30">
                  <Layers className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No flashcards found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Try adjusting your filters or create a new deck to get
                    started studying.
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

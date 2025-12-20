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
import { Sidebar } from "@/features/knowldge-test/components/Sidebar";
import { QuizCard } from "@/features/knowldge-test/components/QuizCard";
import { FlashcardCard } from "@/features/knowldge-test/components/FlashcardCard";

type Section = "quizzes" | "flashcards";

import {
  useGetAllQuizzesQuery,
  useDeleteQuizMutation,
  useGetAllFilesQuery,
} from "@/lib/store/apiSlice";

interface FlashcardSet {
  id: string;
  title: string;
  cards: number;
  category?: string;
  documentName?: string;
  createdAt: string;
  mastery?: number; // percentage
}

const sampleFlashcards: FlashcardSet[] = [
  {
    id: "f1",
    title: "Spanish - Food",
    cards: 40,
    category: "Language",
    documentName: "SpanishNotes.pdf",
    createdAt: "2025-03-10",
    mastery: 45,
  },
  {
    id: "f2",
    title: "Calculus - Derivatives",
    cards: 30,
    category: "Mathematics",
    documentName: "CalculusBook.pdf",
    createdAt: "2025-02-25",
    mastery: 10,
  },
  {
    id: "f3",
    title: "World History Timeline",
    cards: 55,
    category: "History",
    documentName: "History.pdf",
    createdAt: "2025-03-01",
    mastery: 75,
  },
];

export default function KnowledgeTestPage() {
  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    error: quizzesFetchingError,
    refetch: refetchQuizzes,
  } = useGetAllQuizzesQuery();
  const { data: documentsData, refetch: refetchDocuments } =
    useGetAllFilesQuery();
  const [deleteQuiz] = useDeleteQuizMutation();

  const [section, setSection] = useState<Section>("quizzes");

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
    return map;
  }, [documentsData]);



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
                ? "/dashboard/quizzes/create"
                : "/dashboard/flashcards/create"
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
          documentsMap={documentsMap}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          quizzesData={quizzesData || []}
          flashcards={sampleFlashcards}
        />

        {/* Main Content Grid */}
        <main className="col-span-1 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card (Placeholder for quick access) */}
            <Link
              href={
                section === "quizzes"
                  ? "/dashboard/quizzes/create"
                  : "/dashboard/flashcards/create"
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
              quizzesData?.map((q) => (
                <QuizCard key={q.id} q={q} onDelete={(id) => deleteQuiz(id)} />
              ))}

            {/* Flashcard Cards */}
            {section === "flashcards" &&
              sampleFlashcards?.map((f) => <FlashcardCard f={f} />)}

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
            {section === "flashcards" && sampleFlashcards?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-muted/30">
                <Layers className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No flashcards found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Try adjusting your filters or create a new deck to get started
                  studying.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

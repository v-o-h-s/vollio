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
import { Plus } from "lucide-react";
import { Sidebar } from "@/features/knowldge-test/sidebar/components/Sidebar";
import { QuizCard } from "@/features/knowldge-test/quizzes/components/QuizCard";
import { FlashcardCard } from "@/features/knowldge-test/flashcards/components/FlashcardCard";
import { cn } from "@/lib/utils";
import { LuBrain as Brain, LuLayers as RiStackLine } from "react-icons/lu";
import { GrTestDesktop } from "react-icons/gr";
type Section = "quizzes" | "flashcards";

import {
  useGetAllQuizzesQuery,
  useDeleteQuizMutation,
  useGetAllDocumentsQuery,
  useGetAllFlashCardsSetsQuery,
  useDeleteFlashCardsSetMutation,
} from "@/lib/store/apiSlice";

export default function KnowledgeTestPage() {
  const { data: quizzesData, isLoading: isLoadingQuizzes } =
    useGetAllQuizzesQuery();
  const { data: documentsData } = useGetAllDocumentsQuery();
  const [deleteQuiz] = useDeleteQuizMutation();

  const { data: flashcardsData, isLoading: isLoadingFlashcards } =
    useGetAllFlashCardsSetsQuery();
  const [deleteFlashcardSet] = useDeleteFlashCardsSetMutation();

  const [section, setSection] = useState<Section>("quizzes");

  const documentsMap = useMemo(() => {
    const map = new Map<string, string>();
    documentsData?.forEach((document) => map.set(document.id, document.name));
    return map;
  }, [documentsData]);

  // Clean up the mapped data to match what the cards EXPECT
  const mappedFlashcards = useMemo(() => {
    if (!flashcardsData) return [];
    return flashcardsData;
  }, [flashcardsData]);

  return (
    <div className="space-y-8 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl  bg-background text-foreground">
              <GrTestDesktop className="w-6 h-6" />
            </div>
            Knowldge testing
          </h1>
          <p className="text-muted-foreground mt-2 md:ml-14 max-w-2xl">
            Transform your documents into interactive quizzes and flashcards to
            master your material more effectively.
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
                "shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 font-bold border-none h-11 px-6 hover:scale-105 active:scale-95 group"
              )}
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-all duration-300" />
              {section === "quizzes" ? "New Quiz" : "New Deck"}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <Sidebar
          section={section}
          setSection={setSection}
          quizzesData={quizzesData || []}
          flashcards={flashcardsData || []}
        />

        <main className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <Link
              href={
                section === "quizzes"
                  ? "/dashboard/knowledge-test/quizzes/create"
                  : "/dashboard/knowledge-test/flashcards/create"
              }
              className="h-full"
            >
              <Card
                className={cn(
                  "h-full border-2 border-dashed border-border/60 bg-muted/5 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[240px] group relative overflow-hidden",
                  section === "quizzes"
                    ? "hover:border-indigo-500/50"
                    : "hover:border-pink-500/50"
                )}
              >
                <div className="absolute inset-0 bg-linear-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className={cn(
                    "p-4 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm",
                    section === "quizzes"
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                      : "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                  )}
                >
                  {section === "quizzes" ? (
                    <Brain className="w-8 h-8" />
                  ) : (
                    <RiStackLine className="w-8 h-8" />
                  )}
                </div>
                <h3 className="font-bold text-lg mb-1 relative z-10">
                  Create New
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-[200px] relative z-10">
                  {section === "quizzes"
                    ? "Generate a tailored quiz from your notes"
                    : "Build a new flashcard deck for study"}
                </p>
              </Card>
            </Link>

            {section === "quizzes" && isLoadingQuizzes && (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground animate-pulse">
                  Loading quizzes...
                </p>
              </div>
            )}
            {section === "quizzes" &&
              !isLoadingQuizzes &&
              quizzesData?.map((q) => (
                <QuizCard key={q.id} q={q} onDelete={(id) => deleteQuiz(id)} />
              ))}

            {section === "flashcards" && isLoadingFlashcards && (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground animate-pulse">
                  Loading decks...
                </p>
              </div>
            )}
            {section === "flashcards" &&
              !isLoadingFlashcards &&
              flashcardsData?.map((set) => (
                <FlashcardCard
                  key={set.id}
                  set={set}
                  onDelete={(id) => deleteFlashcardSet(id)}
                />
              ))}

            {section === "quizzes" && quizzesData?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-2xl border-dashed bg-muted/10">
                <div className="p-4 bg-muted/30 rounded-full mb-4">
                  <Brain className="w-8 h-8 text-muted-foreground/50 " />
                </div>
                <h3 className="text-xl font-semibold mb-2">No quizzes yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  You haven't created any quizzes yet. Generate one from your
                  documents to start testing your knowledge.
                </p>
                <Link href="/dashboard/knowledge-test/quizzes/create">
                  <Button>Create Your First Quiz</Button>
                </Link>
              </div>
            )}

            {section === "flashcards" &&
              !isLoadingFlashcards &&
              flashcardsData?.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-2xl border-dashed bg-muted/10">
                  <div className="p-4 bg-muted/30 rounded-full mb-4">
                    <RiStackLine className="w-8 h-8 text-muted-foreground/50 " />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No flashcards found
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    Create a new deck to get started studying or adjust your
                    filters.
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

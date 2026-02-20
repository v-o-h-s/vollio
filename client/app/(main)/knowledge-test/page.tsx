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
import { Plus, Brain, Layers as RiStackLine } from "lucide-react";
import { Sidebar } from "@/features/knowldge-test/sidebar/components/Sidebar";
import { QuizCard } from "@/features/knowldge-test/quizzes/components/QuizCard";
import { FlashcardCard } from "@/features/knowldge-test/flashcards/components/FlashcardCard";
import { SimpleEmptyState } from "@/components/ui/simple-empty-state";
import { cn } from "@/lib/utils";
import { GrTestDesktop } from "react-icons/gr";
type Section = "quizzes" | "flashcards";

import { useRouter } from "next/navigation";
import { RobustFetchError } from "@/components/RobustFetchError";

import {
  useGetAllQuizzesQuery,
  useDeleteQuizMutation,
  useGetAllFlashCardsSetsQuery,
  useDeleteFlashCardsSetMutation,
} from "@/lib/store/apiSlice";

export default function KnowledgeTestPage() {
  const router = useRouter();
  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = useGetAllQuizzesQuery();
  const [deleteQuiz] = useDeleteQuizMutation();

  const {
    data: flashcardsData,
    isLoading: isLoadingFlashcards,
    error: flashcardsError,
    refetch: refetchFlashcards,
  } = useGetAllFlashCardsSetsQuery();
  const [deleteFlashcardSet] = useDeleteFlashCardsSetMutation();

  const [section, setSection] = useState<Section>("quizzes");
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
                ? "/knowledge-test/quizzes/create"
                : "/knowledge-test/flashcards/create"
            }
          >
            <Button
              className={cn(
                "shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 font-bold border-none h-11 px-6 hover:scale-105 active:scale-95 group",
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
        {section === "quizzes" && quizzesError && (
          <RobustFetchError
            errorMessage={
              (quizzesError as any).message || "Failed to load quizzes"
            }
            onRetry={refetchQuizzes}
            onBack={() => router.back()}
          />
        )}
        {section === "flashcards" && flashcardsError && (
          <RobustFetchError
            errorMessage={
              (flashcardsError as any).message || "Failed to load flashcards"
            }
            onRetry={refetchFlashcards}
            onBack={() => router.back()}
          />
        )}

        <main className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="col-span-full">
                <SimpleEmptyState
                  icon={Brain}
                  title="No quizzes yet"
                  description="Transform your documents into interactive quizzes to master your material."
                  actionLabel="Create Your First Quiz"
                  onAction={() => router.push("/knowledge-test/quizzes/create")}
                />
              </div>
            )}

            {section === "flashcards" &&
              !isLoadingFlashcards &&
              flashcardsData?.length === 0 && (
                <div className="col-span-full">
                  <SimpleEmptyState
                    icon={RiStackLine}
                    title="No flashcards found"
                    description="Build a new flashcard deck to get started studying or adjust your filters."
                    actionLabel="Create New Deck"
                    onAction={() =>
                      router.push("/knowledge-test/flashcards/create")
                    }
                  />
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

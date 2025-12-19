"use client";

import React, { useState } from "react";
import { StudyMode, StudyResults } from "@/components/flashcards";
import { useRouter } from "next/navigation";

// Demo flashcard data
const demoFlashcards = [
  {
    id: "1",
    front: "What is React?",
    back: "A JavaScript library for building user interfaces, particularly web applications with interactive UIs.",
    hint: "It's developed by Facebook"
  },
  {
    id: "2",
    front: "What does JSX stand for?",
    back: "JavaScript XML - a syntax extension for JavaScript that allows you to write HTML-like code in JavaScript.",
  },
  {
    id: "3",
    front: "What is a React Hook?",
    back: "Functions that let you use state and other React features in functional components.",
    hint: "They start with 'use'"
  },
  {
    id: "4",
    front: "What is the Virtual DOM?",
    back: "A programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM.",
  },
  {
    id: "5",
    front: "What is useState?",
    back: "A React Hook that lets you add state to functional components.",
    hint: "It returns an array with two elements"
  },
];

interface StudyResult {
  cardId: string;
  correct: boolean;
  timeSpent: number;
}

export default function StudyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [studyResults, setStudyResults] = useState<StudyResult[] | null>(null);
  const [sessionStartTime] = useState(Date.now());

  const handleStudyComplete = (results: StudyResult[]) => {
    setStudyResults(results);
  };

  const handleStudyAgain = () => {
    setStudyResults(null);
  };

  const handleGoHome = () => {
    router.push("/dashboard/knowledge-test");
  };

  const totalTime = studyResults ? Date.now() - sessionStartTime : 0;

  return (
    <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {!studyResults ? (
        <StudyMode
          flashcards={demoFlashcards}
          onComplete={handleStudyComplete}
          onExit={handleGoHome}
        />
      ) : (
        <StudyResults
          results={studyResults}
          flashcards={demoFlashcards}
          totalTime={totalTime}
          onStudyAgain={handleStudyAgain}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}
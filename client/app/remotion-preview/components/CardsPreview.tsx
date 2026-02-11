"use client";

import React from "react";
import { FlashcardCard } from "./FlashcardCard";
import { QuizCard } from "./QuizCard";
import { mockQuizzes, mockFlashcardSets } from "../mockData";

export default function CardsPreview() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "#0f172a",
          }}
        >
          Quiz Cards
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {mockQuizzes.map((quiz: any) => (
            // @ts-ignore
            <QuizCard key={quiz.id} q={quiz} onDelete={() => {}} />
          ))}
        </div>
      </div>

      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1rem",
            color: "#0f172a",
          }}
        >
          Flashcard Cards
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {mockFlashcardSets.map((set: any) => (
            // @ts-ignore
            <FlashcardCard key={set.id} set={set} onDelete={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}

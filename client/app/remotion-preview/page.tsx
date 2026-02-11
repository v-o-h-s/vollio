"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import DashboardPreview from "./components/DashboardPreview";
import CardsPreview from "./components/CardsPreview";
import DocumentViewerPreview from "./components/DocumentViewerPreview";
import QuizQuestionPreview from "./components/QuizQuestionPreview";
import FlashcardStudyPreview from "./components/FlashcardStudyPreview";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function RemotionPreviewPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const components = {
    dashboard: <DashboardPreview />,
    cards: <CardsPreview />,
    quizQuestion: <QuizQuestionPreview />,
    flashcardStudy: <FlashcardStudyPreview />,
    documentViewer: <DocumentViewerPreview />,
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Remotion Component Preview
        </h1>
        <div className="flex bg-muted p-1 rounded-md">
          {Object.keys(components).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-all ${
                activeTab === key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {key.charAt(0).toUpperCase() +
                key
                  .slice(1)
                  .replace(/([A-Z])/g, " $1")
                  .trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {components[activeTab as keyof typeof components]}
      </div>
    </div>
  );
}

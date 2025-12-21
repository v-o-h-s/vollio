"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetFlashCardsSetQuery } from "@/lib/store/apiSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Lightbulb,
  Loader2,
  Maximize2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function FlashCardStudyPage() {
  const params = useParams();
  const router = useRouter();
  const setId = params.id as string;

  const {
    data: flashcardSet,
    isLoading,
    isError,
    refetch,
  } = useGetFlashCardsSetQuery(setId, {
    skip: !setId,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [cards, setCards] = useState<any[]>([]);

  // Initialize cards when data loads
  useEffect(() => {
    if (flashcardSet?.flashCards) {
      setCards([...flashcardSet.flashCards]);
    }
  }, [flashcardSet]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " " || e.key === "Enter") handleFlip();
      if (e.key === "h") setShowHint((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFlipped, cards]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setShowHint(false);
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    // Restore original order
    if (flashcardSet?.flashCards) {
      setCards([...flashcardSet.flashCards]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading flashcards...</p>
      </div>
    );
  }

  if (isError || !flashcardSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <XCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold">Failed to load flashcard set</h2>
        <div className="flex gap-4">
          <Button onClick={() => refetch()}>Try Again</Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
              <h1 className="text-sm font-semibold hidden sm:block line-clamp-1 max-w-[200px]">
                {flashcardSet.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono font-bold text-foreground">
                {currentIndex + 1}
              </span>
              /<span>{cards.length}</span>
            </div>
          </div>

          <div className="mt-3 relative h-1 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-8">
        <div className="w-full max-w-3xl perspective-1000">
          <motion.div
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] cursor-pointer"
            onClick={handleFlip}
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* FRONT */}
            <Card className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-8 md:p-12 text-center shadow-xl border-border/60 bg-gradient-to-br from-card to-muted/20">
              <div className="absolute top-4 left-4 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                Front
              </div>
              <div className="prose dark:prose-invert max-w-none text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed overflow-y-auto max-h-full">
                {currentCard?.front}
              </div>
              <div className="absolute bottom-4 text-xs text-muted-foreground animate-pulse">
                Click or Press Space to Flip
              </div>
            </Card>

            {/* BACK */}
            <Card
              className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-8 md:p-12 text-center shadow-xl border-t-4 border-t-pink-500 bg-card"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="absolute top-4 left-4 text-xs font-bold text-pink-500 tracking-wider uppercase">
                Back
              </div>
              <div className="prose dark:prose-invert max-w-none text-lg sm:text-xl md:text-2xl leading-relaxed overflow-y-auto max-h-full">
                {currentCard?.back}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-3xl mt-8 space-y-6">
          {/* Hint Section */}
          <AnimatePresence>
            {showHint && currentCard?.hint && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3"
              >
                <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-1">
                    Hint
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-200/80 text-sm">
                    {currentCard.hint}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShuffle}
                title="Shuffle Cards"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              {currentCard?.hint && (
                <Button
                  variant={showHint ? "secondary" : "outline"}
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(!showHint);
                  }}
                  title="Toggle Hint"
                  className={cn(
                    showHint && "text-yellow-600 dark:text-yellow-400"
                  )}
                >
                  <Lightbulb className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-28"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Prev
              </Button>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1}
                className="w-28 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

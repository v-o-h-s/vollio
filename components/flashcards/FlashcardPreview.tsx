"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Eye, EyeOff } from "lucide-react";

interface FlashcardPreviewProps {
  front: string;
  back: string;
  hint?: string;
  className?: string;
  showControls?: boolean;
}

export function FlashcardPreview({
  front,
  back,
  hint,
  className = "",
  showControls = true,
}: FlashcardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReset = () => {
    setIsFlipped(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Flashcard */}
      <div
        className={`relative w-full h-64 cursor-pointer transition-all duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <Card className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/50 dark:to-rose-900/50 border-pink-200 dark:border-pink-800 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-pink-600 dark:text-pink-400 font-medium">
                  Question
                </div>
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  {front || "Front side content..."}
                </p>
                {hint && (
                  <div className="mt-4 p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <p className="text-sm text-pink-700 dark:text-pink-300 italic">
                      💡 {hint}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <Card className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-900/50 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-medium">
                  Answer
                </div>
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  {back || "Back side content..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            className="hover:scale-105 transition-transform duration-200"
          >
            {isFlipped ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {isFlipped ? "Show Front" : "Show Back"}
          </Button>
          
          {isFlipped && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="hover:scale-105 transition-transform duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      )}

      {/* Status */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isFlipped ? "Showing answer" : "Showing question"} • Click card to flip
        </p>
      </div>
    </div>
  );
}
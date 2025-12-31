"use client";

import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface FlashcardEditorProps {
  card: FlashcardItem;
  cardIndex: number;
  totalCards: number;
  onUpdate: (id: string, field: keyof FlashcardItem, value: string) => void;
  onDuplicate: (card: FlashcardItem) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  isSaved?: boolean;
}

export function FlashcardEditor({
  card,
  cardIndex,
  totalCards,
  onUpdate,
  onDuplicate,
  onDelete,
  canDelete,
  isSaved = false,
}: FlashcardEditorProps) {
  const frontInputRef = useRef<HTMLTextAreaElement>(null);
  const backInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textareas
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
  };

  // Focus on front input when card changes
  useEffect(() => {
    if (frontInputRef.current) {
      frontInputRef.current.focus();
    }
  }, [card.id]);

  const isComplete = card.front.trim() && card.back.trim();

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Card {cardIndex + 1} of {totalCards}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(card)}
              className="hover:scale-105 transition-transform duration-200"
              title="Duplicate card"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(card.id)}
              disabled={!canDelete}
              className="hover:scale-105 transition-transform duration-200 hover:text-destructive disabled:opacity-50"
              title={canDelete ? "Delete card" : "Cannot delete the last card"}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Front Side */}
        <div className="space-y-2">
          <Label htmlFor={`front-${card.id}`} className="flex items-center gap-2">
            <RobotIcon className="w-4 h-4 text-pink-500" />
            Front Side *
          </Label>
          <Textarea
            ref={frontInputRef}
            id={`front-${card.id}`}
            placeholder="Enter the question or prompt..."
            value={card.front}
            onChange={(e) => {
              onUpdate(card.id, "front", e.target.value);
              autoResize(e.target);
            }}
            className="border-border/50 focus:border-primary/50 resize-none min-h-[100px] transition-colors duration-200"
            rows={4}
          />
        </div>

        <Separator className="my-4" />

        {/* Back Side */}
        <div className="space-y-2">
          <Label htmlFor={`back-${card.id}`} className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            Back Side *
          </Label>
          <Textarea
            ref={backInputRef}
            id={`back-${card.id}`}
            placeholder="Enter the answer or explanation..."
            value={card.back}
            onChange={(e) => {
              onUpdate(card.id, "back", e.target.value);
              autoResize(e.target);
            }}
            className="border-border/50 focus:border-primary/50 resize-none min-h-[100px] transition-colors duration-200"
            rows={4}
          />
        </div>

        {/* Hint */}
        <div className="space-y-2">
          <Label htmlFor={`hint-${card.id}`} className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Hint (Optional)
          </Label>
          <Input
            id={`hint-${card.id}`}
            placeholder="Add a helpful hint..."
            value={card.hint || ""}
            onChange={(e) => onUpdate(card.id, "hint", e.target.value)}
            className="border-border/50 focus:border-primary/50 transition-colors duration-200"
          />
        </div>

        {/* Card Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Complete
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Incomplete
                </span>
              </>
            )}
          </div>
          
          {isSaved && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved
              </span>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Card Progress</span>
            <span className="text-muted-foreground">
              {isComplete ? "100%" : "0%"}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                isComplete
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 w-full"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 w-0"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
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
    <div className="space-y-10 bg-muted/5 p-10 rounded-[40px] border border-border/40 shadow-2xl shadow-background/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-black italic uppercase tracking-tighter text-2xl leading-none">
            Flashcard {cardIndex + 1}
          </h3>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
            Card {cardIndex + 1} of {totalCards}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(card)}
            className="rounded-full h-10 w-10 p-0 border-border/40 hover:bg-background hover:scale-110 transition-all duration-300"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(card.id)}
            disabled={!canDelete}
            className="rounded-full h-10 w-10 p-0 border-border/40 hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all duration-300 disabled:opacity-30"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Front Side */}
        <div className="space-y-4">
          <Label
            htmlFor={`front-${card.id}`}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"
          >
            <RobotIcon className="w-4 h-4 text-pink-500" />
            Front Face
          </Label>
          <Textarea
            ref={frontInputRef}
            id={`front-${card.id}`}
            placeholder="What is the question?"
            value={card.front}
            onChange={(e) => {
              onUpdate(card.id, "front", e.target.value);
              autoResize(e.target);
            }}
            className="bg-background/80 border-none shadow-xl focus-visible:ring-2 focus-visible:ring-primary/20 rounded-3xl min-h-[160px] p-6 text-lg font-bold resize-none leading-relaxed transition-all duration-300"
          />
        </div>

        {/* Back Side */}
        <div className="space-y-4">
          <Label
            htmlFor={`back-${card.id}`}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-primary" />
            Back Face
          </Label>
          <Textarea
            ref={backInputRef}
            id={`back-${card.id}`}
            placeholder="And the answer is..."
            value={card.back}
            onChange={(e) => {
              onUpdate(card.id, "back", e.target.value);
              autoResize(e.target);
            }}
            className="bg-background/80 border-none shadow-xl focus-visible:ring-2 focus-visible:ring-primary/20 rounded-3xl min-h-[160px] p-6 text-lg font-bold resize-none leading-relaxed transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
        {/* Hint */}
        <div className="space-y-2">
          <Label
            htmlFor={`hint-${card.id}`}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
          >
            Pro Tip (Optional)
          </Label>
          <Input
            id={`hint-${card.id}`}
            placeholder="Add a clue..."
            value={card.hint || ""}
            onChange={(e) => onUpdate(card.id, "hint", e.target.value)}
            className="bg-background/60 border-none shadow-lg h-11 rounded-2xl px-4 font-medium"
          />
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-end gap-6 h-11 px-6 bg-background/40 rounded-2xl border border-border/20">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  Ready
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Draft
                </span>
              </div>
            )}
          </div>

          {isSaved && (
            <div className="flex items-center gap-2 border-l border-border/20 pl-6">
              <Check className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Autosaved
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

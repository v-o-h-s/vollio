"use client";

import React from "react";
import { NotionEditor } from "@/components/editor";
import {
  X,
  Sparkles,
  Save,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExplanationBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToNotes: () => void;
  explainResult: {
    data?: any;
    isLoading: boolean;
    error?: any;
  };
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({
  isOpen,
  onClose,
  onSaveToNotes,
  explainResult,
}) => {
  const { data: explanation, isLoading, error } = explainResult;

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 w-[480px] h-[600px] z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Subtle glow */}
      <div className="absolute -inset-px bg-linear-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-2xl blur-xl" />

      {/* Main container with explicit height */}
      <div className="relative h-full bg-background/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-2xl flex flex-col overflow-hidden">
        {/* Clean header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-current" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold text-foreground">
                AI Explanation
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-400/20 blur-2xl rounded-full animate-pulse" />
                    <Loader2 className="relative w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                  <div className="text-center space-y-1.5">
                    <p className="text-sm font-medium text-foreground">
                      Analyzing your selection...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take a few seconds
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-7 h-7 text-destructive" />
                  </div>
                  <div className="space-y-2.5 max-w-[320px]">
                    <h4 className="font-heading text-lg font-semibold text-foreground">
                      Something went wrong
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We couldn't analyze this text. Please try selecting a
                      different passage or try again later.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="mt-2 rounded-lg"
                  >
                    Close
                  </Button>
                </div>
              ) : explanation ? (
                <div className="space-y-5 animate-in fade-in duration-400">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground mb-3 leading-snug">
                      {explanation.title}
                    </h2>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none 
                    prose-headings:font-heading prose-headings:text-foreground
                    prose-p:text-foreground/90 prose-p:leading-relaxed
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:text-foreground/90 prose-ol:text-foreground/90
                    prose-li:text-foreground/90
                    prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                  "
                  >
                    <NotionEditor
                      content={explanation}
                      editable={false}
                      className="bg-transparent border-none p-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
                    <FileText className="w-8 h-8 text-muted-foreground/50 stroke-[1.5]" />
                  </div>
                  <h4 className="font-heading text-base font-semibold text-foreground/80 mb-2">
                    Select text to explain
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                    Highlight any passage in your document and I'll provide a
                    clear explanation.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer - only show when there's content */}
        {explanation && !isLoading && (
          <div className="shrink-0 p-4 border-t border-border/30 bg-muted/5">
            <Button
              onClick={onSaveToNotes}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save to Notes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Summary } from "@/lib/types/summary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  summary: Summary | null;
  onRemoveMainPoint: (text: string) => void;
}

export const SummarySidebar = ({
  isOpen,
  onClose,
  summary,
  onRemoveMainPoint,
}: SummarySidebarProps) => {
  if (!isOpen) return null;

  const mainPoints = summary?.mainPoints || [];

  return (
    <div className="absolute top-20 right-4 w-80 max-h-[calc(100vh-8rem)] z-30 flex flex-col bg-background/80 backdrop-blur-md border border-border rounded-xl shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Summary Main Points</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-muted"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {mainPoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <FileText className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">No main points yet</p>
              <p className="text-xs mt-1">
                Select text and click &quot;Add to Summary&quot;
              </p>
            </div>
          ) : (
            mainPoints.map((point, index) => (
              <div
                key={index}
                className="group relative p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-sm text-foreground leading-relaxed">
                    {point}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={() => onRemoveMainPoint(point)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {mainPoints.length > 0 && (
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            {mainPoints.length} main{" "}
            {mainPoints.length === 1 ? "point" : "points"}
          </p>
        </div>
      )}
    </div>
  );
};

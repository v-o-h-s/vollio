"use client";

import React from "react";
import { LuChevronUp as ChevronUp } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface ShowHeaderTabProps {
  onClick: () => void;
  currentPage: number;
  totalPages: number;
  isFocused?: boolean;
}

export function ShowHeaderTab({
  onClick,
  currentPage,
  totalPages,
  isFocused,
}: ShowHeaderTabProps) {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 group/show-header">
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-b-2xl border-x border-b border-t-0",
          "bg-white/80 dark:bg-background/80 backdrop-blur-md shadow-lg",
          "text-muted-foreground hover:text-primary transition-all duration-300",
          "cursor-pointer active:scale-95 group-hover/show-header:py-2.5",
          "animate-in slide-in-from-top-4 duration-500",
          isFocused ? "border-primary/30" : "border-border/40",
        )}
      >
        <div className="relative flex flex-col items-center justify-center min-w-[60px] h-8 overflow-hidden">
          {/* Page Numbers - Fades out on hover */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/70 transition-all duration-300 group-hover/show-header:opacity-0 group-hover/show-header:-translate-y-2">
            <span>{currentPage}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-60">{totalPages}</span>
          </div>

          {/* Extend Text - Fades in on hover */}
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 translate-y-2 group-hover/show-header:opacity-100 group-hover/show-header:translate-y-0 transition-all duration-300">
            extend
          </span>

          {/* Chevron - Always visible but animated */}
          <ChevronUp className="w-3 h-3 rotate-180 opacity-50 group-hover/show-header:opacity-100 transition-all duration-300 translate-y-0 group-hover/show-header:translate-y-1" />
        </div>
      </button>
    </div>
  );
}

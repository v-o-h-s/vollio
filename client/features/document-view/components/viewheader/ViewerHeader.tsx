"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LuFileText as FileText,
  LuChevronDown as ChevronDown,
  LuEye as Eye,
  LuNotebookPen as NotebookPen,
} from "react-icons/lu";
import { HiTag as TagIcon } from "react-icons/hi2";
import { FiHome as Home } from "react-icons/fi";
import { RiRobot3Fill as Bot } from "react-icons/ri";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DocumentViewerHeaderProps } from "./lib/types";
import { HIGHLIGHT_COLORS } from "./lib/constants";
import { PageNavigation } from "./PageNavigation";
import { ZoomControls } from "./ZoomControls";
export function ViewerHeader({
  document,
  isHeaderVisible,
  setIsHeaderVisible,

  documentViewerRef,
  currentHighlightColor = "#FFEB3B",
  onHighlightColorChange,
  onToggleTags,
  isTagsOpen,
  onToggleVollAi,
  isVollAiOpen,
  onToggleVollNotes,
  isVollNotesOpen,
  viewerWidth = "100%",
  isFocused,
}: DocumentViewerHeaderProps) {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState(0);

  // Observe header width to determine if we should collapse tools
  useEffect(() => {
    if (!headerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(headerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Only collapse tools section when header is narrow (< 550px)
  const shouldCollapseTools = headerWidth < 550;
  const showFullTitle = headerWidth > 500;
  const showToolText = headerWidth > 850;

  const handleColorChange = (color: string) => {
    if (onHighlightColorChange) {
      onHighlightColorChange(color);
    }
  };

  return (
    <div
      ref={headerRef}
      className={`absolute top-2 left-1/2 z-20 transition-all duration-500 ease-in-out ${
        !isHeaderVisible
          ? "-translate-y-full -translate-x-1/2 opacity-0 pointer-events-none"
          : "-translate-x-1/2 translate-y-0 opacity-100"
      }`}
      style={{
        width: `calc(${viewerWidth} - 2rem)`,
        maxWidth: `calc(${viewerWidth} - 0.5rem)`,
      }}
    >
      {/* Enhanced stylish header with glassmorphism effect */}
      <div
        className={cn(
          "bg-white dark:bg-background backdrop-blur-xl border rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl transition-all duration-300",
          isFocused
            ? "border-primary/40 shadow-primary/10 ring-1 ring-primary/20"
            : "border-white/20 dark:border-white/10 shadow-black/10 dark:shadow-black/30",
        )}
      >
        <div className="bg-gradient-to-r from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-xl sm:rounded-2xl">
          {/* Always horizontal layout */}
          <div className="flex flex-row items-center justify-between px-2 sm:px-3 lg:px-4 py-2 gap-2">
            {/* Left Section: Back & Title */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full shrink-0 hover:bg-primary/10 hover:text-primary hover:scale-110 active:scale-95 transition-all duration-200"
                title="Back to Documents"
              >
                <Home size={12} className="sm:w-4 sm:h-4" />
              </Button>

              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <div
                  className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center shrink-0 shadow-md transition-all",
                    "bg-gradient-to-br from-red-500 via-red-600 to-red-700",
                  )}
                >
                  <FileText size={10} className="sm:w-3 sm:h-3 text-white" />
                </div>
                <h1
                  className={cn(
                    "text-xs sm:text-sm font-semibold truncate transition-all duration-300",
                    isFocused ? "text-primary" : "text-foreground",
                    !showFullTitle
                      ? "max-w-[40px] sm:max-w-[80px]"
                      : "max-w-[120px] sm:max-w-[200px] lg:max-w-[300px]",
                  )}
                >
                  {document.name}
                </h1>
              </div>
            </div>

            {/* Middle Section: Navigation & Zoom - Always visible */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <div className="w-px h-4 bg-border/50 shrink-0" />
              <PageNavigation documentViewerRef={documentViewerRef} />
              <div className="w-px h-4 bg-border/50 shrink-0" />
              <ZoomControls documentViewerRef={documentViewerRef} />
              <div className="w-px h-4 bg-border/50 shrink-0" />
            </div>

            {/* Right Section: Tools */}
            {/* Compact: Dropdown Menu (when header is narrow) */}
            {shouldCollapseTools ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 w-7 sm:w-8 p-0 shrink-0"
                    title="Tools"
                  >
                    <ChevronDown
                      size={14}
                      className="sm:w-4 sm:h-4 text-muted-foreground"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 sm:w-56 overflow-hidden rounded-xl border-border/50 backdrop-blur-xl"
                >
                  <div className="p-2 space-y-2">
                    {/* Tools Section */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider px-2 py-1">
                        AI & Notes
                      </p>
                      <button
                        onClick={onToggleVollAi}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all group flex items-center justify-between",
                          isVollAiOpen
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-accent",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Bot size={16} />
                          <span>Voll-AI</span>
                        </div>
                        {isVollAiOpen && (
                          <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50 animate-pulse" />
                        )}
                      </button>

                      <button
                        onClick={onToggleVollNotes}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all group flex items-center justify-between",
                          isVollNotesOpen
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-accent",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <NotebookPen size={16} />
                          <span>Voll-Notes</span>
                        </div>
                        {isVollNotesOpen && (
                          <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50 animate-pulse" />
                        )}
                      </button>

                      <button
                        onClick={onToggleTags}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all group flex items-center justify-between",
                          isTagsOpen
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-accent",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <TagIcon size={16} />
                          <span>Tags</span>
                        </div>
                        {isTagsOpen && (
                          <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50 animate-pulse" />
                        )}
                      </button>
                    </div>

                    <DropdownMenuSeparator className="bg-border/50" />

                    {/* Highlight Section */}
                    <div className="space-y-2 p-1">
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider px-1">
                        Highlight
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 px-1">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleColorChange(color.value)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 transition-all cursor-pointer relative",
                              currentHighlightColor === color.value
                                ? "border-primary ring-2 ring-primary/20 ring-offset-1"
                                : "border-transparent hover:scale-110",
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {currentHighlightColor === color.value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-foreground/20" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <DropdownMenuSeparator className="bg-border/50" />

                    {/* Meta */}
                    <button
                      onClick={() => setIsHeaderVisible(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:bg-red-500/10 hover:text-red-500 transition-all group flex items-center gap-2"
                    >
                      <Eye size={16} />
                      <span>Hide Header</span>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Desktop: Inline Tool Buttons
              <div className="flex items-center gap-1 sm:gap-2 justify-end">
                {/* AI Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleVollAi}
                  className={cn(
                    "cursor-pointer h-8 px-2 shrink-0 rounded-lg group transition-all",
                    isVollAiOpen
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent",
                  )}
                  title="Voll-AI"
                >
                  <div className="relative">
                    <Bot size={16} />
                    {isVollAiOpen && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                  {showToolText && (
                    <span className="text-xs ml-1.5 font-medium">AI</span>
                  )}
                </Button>

                {/* Notes Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleVollNotes}
                  className={cn(
                    "cursor-pointer h-8 px-2 shrink-0 rounded-lg group transition-all",
                    isVollNotesOpen
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent",
                  )}
                  title="Voll-Notes"
                >
                  <div className="relative">
                    <NotebookPen size={16} />
                    {isVollNotesOpen && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                  {showToolText && (
                    <span className="text-xs ml-1.5 font-medium">Notes</span>
                  )}
                </Button>

                {/* Tags Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTags}
                  className={cn(
                    "cursor-pointer h-8 px-2 shrink-0 rounded-lg group transition-all",
                    isTagsOpen
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent",
                  )}
                  title="Tags"
                >
                  <div className="relative">
                    <TagIcon size={16} />
                    {isTagsOpen && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                  {showToolText && (
                    <span className="text-xs ml-1.5 font-medium">Tags</span>
                  )}
                </Button>

                <div className="w-px h-4 bg-border/50 mx-1 shrink-0" />

                {/* Hide Header */}
                <Button
                  className="cursor-pointer h-8 w-8 p-0 shrink-0 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsHeaderVisible(false)}
                  title="Hide Header (Esc)"
                >
                  <Eye size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

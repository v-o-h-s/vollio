"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LuFileText as FileText,
  LuChevronDown as ChevronDown,
  LuEye as Eye,
  LuMessageSquare as MessageSquare,
} from "react-icons/lu";
import { HiTag as TagIcon } from "react-icons/hi2";
import { FiHome as Home } from "react-icons/fi";
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

  // Only collapse tools section when header is narrow (< 900px)
  // Navigation and zoom always stay inline, only tools go to dropdown
  const shouldCollapseTools = headerWidth < 900;

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
            : "border-white/20 dark:border-white/10 shadow-black/10 dark:shadow-black/30"
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
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full flex-shrink-0"
                title="Back to Documents"
              >
                <Home size={12} className="sm:w-4 sm:h-4" />
              </Button>

              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <div
                  className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center flex-shrink-0 shadow-md transition-all",
                    "bg-gradient-to-br from-red-500 via-red-600 to-red-700"
                  )}
                >
                  <FileText size={10} className="sm:w-3 sm:h-3 text-white" />
                </div>
                <h1
                  className={cn(
                    "text-xs sm:text-sm font-semibold truncate transition-colors",
                    isFocused ? "text-primary" : "text-foreground"
                  )}
                >
                  {document.name}
                </h1>
              </div>
            </div>

            {/* Middle Section: Navigation & Zoom - Always visible */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <div className="w-px h-4 bg-border flex-shrink-0" />
              <PageNavigation documentViewerRef={documentViewerRef} />
              <div className="w-px h-4 bg-border flex-shrink-0" />
              <ZoomControls documentViewerRef={documentViewerRef} />
              <div className="w-px h-4 bg-border flex-shrink-0" />
            </div>

            {/* Right Section: Tools */}
            {/* Compact: Dropdown Menu (when header is narrow) */}
            {shouldCollapseTools ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 w-7 sm:w-8 p-0 flex-shrink-0"
                    title="More tools"
                  >
                    <ChevronDown size={12} className="sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-56">
                  <div className="p-2 space-y-3">
                    {/* Highlight Color Selector */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground px-1">
                        Highlight Color
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 px-1">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleColorChange(color.value)}
                            className={`w-6 h-6 rounded-full border-2 hover:scale-110 active:scale-95 transition-transform cursor-pointer ${
                              currentHighlightColor === color.value
                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                : "border-border hover:border-primary/50"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Tags Toggle */}
                    <button
                      onClick={onToggleTags}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer flex items-center gap-2",
                        isTagsOpen && "bg-accent text-accent-foreground"
                      )}
                    >
                      <TagIcon size={16} />
                      <span>Tags</span>
                    </button>

                    <DropdownMenuSeparator />

                    {/* Hide Header */}
                    <button
                      onClick={() => setIsHeaderVisible(false)}
                      className="w-full text-left px-3 py-2 rounded text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Eye size={16} />
                      <span>Hide Header</span>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Desktop: Inline Tool Buttons (when header is wide enough)
              <div className="flex items-center gap-2 justify-end">
                {/* Highlight Color */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 cursor-pointer px-2 h-8 flex-shrink-0"
                      title="Highlight color"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-white/30"
                        style={{ backgroundColor: currentHighlightColor }}
                      />
                      <span className="text-xs">Color</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="p-2">
                      <p className="text-xs font-medium mb-2 text-muted-foreground">
                        Highlight
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => handleColorChange(color.value)}
                            className={`w-8 h-8 rounded-full border-2 hover:scale-110 active:scale-95 transition-transform cursor-pointer ${
                              currentHighlightColor === color.value
                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                : "border-border hover:border-primary/50"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tags Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTags}
                  className={cn(
                    "cursor-pointer h-8 px-2 flex-shrink-0",
                    isTagsOpen && "bg-accent text-accent-foreground"
                  )}
                  title="Tags"
                >
                  <TagIcon size={14} />
                  <span className="text-xs ml-1">Tags</span>
                </Button>

                {/* Hide Header */}
                <Button
                  className="cursor-pointer h-8 px-2 flex-shrink-0"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsHeaderVisible(false)}
                  title="Hide Header (Esc)"
                >
                  <Eye size={14} />
                  <span className="text-xs ml-1">Hide</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

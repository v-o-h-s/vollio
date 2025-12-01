"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useShortcuts from "@/hooks/use-shortcuts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  FileText,
  Palette,
  ChevronDown,
  Highlighter,
  Circle,
  CircleSlash2,
  Maximize,
  Minimize,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Home,
  Tag as TagIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PDFDocument } from "@/lib/types/pdf";
import { cn } from "@/lib/utils";

export interface PDFViewerHeaderProps {
  /** Function to toggle noter */
  onToggleNoter?: () => void;
  /** PDF document being viewed */
  pdfDocument: PDFDocument;
  /** Whether the header is visible */
  isHeaderVisible: boolean;
  /** Function to set header visibility */
  setIsHeaderVisible: (visible: boolean) => void;
  /** PDF viewer ref */
  pdfViewerRef?: React.RefObject<any>;
  /** Current highlight color */
  currentHighlightColor?: string;
  /** Function to set highlight color */
  onHighlightColorChange?: (color: string) => void;
  /** Function to toggle tags sidebar */
  onToggleTags?: () => void;
  /** Whether tags sidebar is open */
  isTagsOpen?: boolean;
  /** Width of the viewer container (for responsive resizing) */
  viewerWidth?: string;
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFEB3B", rgb: "255, 235, 59" },
  { name: "Green", value: "#4CAF50", rgb: "76, 175, 80" },
  { name: "Blue", value: "#2196F3", rgb: "33, 150, 243" },
  { name: "Pink", value: "#E91E63", rgb: "233, 30, 99" },
  { name: "Orange", value: "#FF9800", rgb: "255, 152, 0" },
];

export function ViewerHeader({
  pdfDocument,
  isHeaderVisible,
  setIsHeaderVisible,
  onToggleNoter,
  pdfViewerRef,
  currentHighlightColor = "#FFEB3B",
  onHighlightColorChange,
  onToggleTags,
  isTagsOpen,
  viewerWidth = "100%",
}: PDFViewerHeaderProps) {
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
      className={`absolute top-4 left-1/2 z-20 transition-all duration-500 ease-in-out ${
        !isHeaderVisible
          ? "-translate-y-full -translate-x-1/2 opacity-0 pointer-events-none"
          : "-translate-x-1/2 translate-y-0 opacity-100"
      }`}
      style={{ 
        width: `calc(${viewerWidth} - 0.5rem)`,
        maxWidth: `calc(${viewerWidth} - 0.5rem)`,
      }}
    >
      {/* Enhanced stylish header with glassmorphism effect */}
      <div className="bg-white dark:bg-background backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl shadow-black/10 dark:shadow-black/30">
        <div className="bg-gradient-to-r from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-xl sm:rounded-2xl">
          {/* Always horizontal layout */}
          <div className="flex flex-row items-center justify-between px-2 sm:px-3 lg:px-4 py-2 gap-2">
            {/* Left Section: Back & Title */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/pdfs")}
                className="cursor-pointer h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full flex-shrink-0"
                title="Back to PDFs"
              >
                <Home size={12} className="sm:w-4 sm:h-4" />
              </Button>

              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded flex items-center justify-center flex-shrink-0 shadow-md">
                  <FileText size={10} className="sm:w-3 sm:h-3 text-white" />
                </div>
                <h1 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  {pdfDocument.filename}
                </h1>
              </div>
            </div>

            {/* Middle Section: Navigation & Zoom - Always visible */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              <div className="w-px h-4 bg-border flex-shrink-0" />
              <PageNavigation pdfViewerRef={pdfViewerRef} />
              <div className="w-px h-4 bg-border flex-shrink-0" />
              <ZoomControls pdfViewerRef={pdfViewerRef} />
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

                    {/* Notes Toggle */}
                    <button
                      onClick={onToggleNoter}
                      className="w-full text-left px-3 py-2 rounded text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <FileText size={16} />
                      <span>Notes</span>
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

                {/* Notes Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleNoter}
                  className="cursor-pointer h-8 px-2 flex-shrink-0"
                  title="Notes"
                >
                  <FileText size={14} />
                  <span className="text-xs ml-1">Notes</span>
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

// Page Navigation Component
function PageNavigation({
  pdfViewerRef,
}: {
  pdfViewerRef?: React.RefObject<any>;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("1");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update page info from PDF viewer
  React.useEffect(() => {
    if (pdfViewerRef?.current) {
      const viewer = pdfViewerRef.current;

      // Get current page and total pages from Syncfusion PDF Viewer
      const updatePageInfo = () => {
        try {
          const current = viewer.currentPageNumber || 1;
          const total = viewer.pageCount || 1;
          setCurrentPage(current);
          setTotalPages(total);
        } catch (error) {
          console.warn("Could not get page info from PDF viewer:", error);
        }
      };

      // Update immediately
      updatePageInfo();

      // Set up interval to keep page info updated
      const interval = setInterval(updatePageInfo, 1000);
      return () => clearInterval(interval);
    }
  }, [pdfViewerRef]);

  const handlePageClick = () => {
    setIsEditing(true);
    setInputValue(currentPage.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputSubmit = () => {
    const pageNum = parseInt(inputValue);
    if (pageNum >= 1 && pageNum <= totalPages && pdfViewerRef?.current) {
      try {
        // Use Syncfusion's navigation API to go to page
        if (pdfViewerRef.current.navigation) {
          pdfViewerRef.current.navigation.goToPage(pageNum);
        } else {
          // Fallback method
          pdfViewerRef.current.goToPage(pageNum);
        }
        setCurrentPage(pageNum);
      } catch (error) {
        console.error("Error navigating to page:", error);
      }
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(currentPage.toString());
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-xs">
      {isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputSubmit}
          onKeyDown={handleInputKeyDown}
          className="w-10 sm:w-12 h-6 text-xs text-center bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 rounded px-1"
        />
      ) : (
        <button
          onClick={handlePageClick}
          className="font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-white/10 dark:hover:bg-white/5"
          title="Click to edit page number"
        >
          {currentPage}
        </button>
      )}
      <span className="text-foreground/60">/</span>
      <span className="font-medium text-foreground/80">
        {totalPages}
      </span>
    </div>
  );
}

// Zoom Controls Component
function ZoomControls({
  pdfViewerRef,
}: {
  pdfViewerRef?: React.RefObject<any>;
}) {
  const getMagnificationModule = () => {
    const viewer = pdfViewerRef?.current;
    return viewer?.magnification ?? viewer?.magnificationModule;
  };

  const [zoomLevel, setZoomLevel] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("100");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update zoom level from PDF viewer
  useEffect(() => {
    if (pdfViewerRef?.current) {
      const viewer = pdfViewerRef.current;

      const updateZoomLevel = () => {
        try {
          const currentZoom = viewer.zoomPercentage || 100;
          setZoomLevel(Math.round(currentZoom));
        } catch (error) {
          console.warn("Could not get zoom level from PDF viewer:", error);
        }
      };

      // Update immediately
      updateZoomLevel();

      // Set up interval to keep zoom level updated
      const interval = setInterval(updateZoomLevel, 1000);
      return () => clearInterval(interval);
    }
  }, [pdfViewerRef]);

  const handleZoomIn = () => {
    const magnification = getMagnificationModule();
    if (!magnification) {
      console.warn(
        "Magnification module is not available on the PDF viewer instance."
      );
      return;
    }

    try {
      magnification.zoomIn();
    } catch (error) {
      console.error("Error zooming in:", error);
    }
  };

  const handleZoomOut = () => {
    const magnification = getMagnificationModule();
    if (!magnification) {
      console.warn(
        "Magnification module is not available on the PDF viewer instance."
      );
      return;
    }

    try {
      magnification.zoomOut();
    } catch (error) {
      console.error("Error zooming out:", error);
    }
  };

  const handleResetZoom = () => {
    const magnification = getMagnificationModule();
    if (!magnification) {
      console.warn(
        "Magnification module is not available on the PDF viewer instance."
      );
      return;
    }

    try {
      magnification.fitToPage();
    } catch (error) {
      console.error("Error resetting zoom:", error);
    }
  };

  const handleZoomClick = () => {
    setIsEditing(true);
    setInputValue(zoomLevel.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleZoomInputSubmit = () => {
    const zoomValue = parseInt(inputValue);
    const magnification = getMagnificationModule();
    if (zoomValue >= 10 && zoomValue <= 400 && magnification) {
      try {
        magnification.zoomTo(zoomValue);
        setZoomLevel(zoomValue);
      } catch (error) {
        console.error("Error setting custom zoom:", error);
      }
    }
    setIsEditing(false);
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleZoomInputSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(zoomLevel.toString());
    }
  };

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="h-6 w-6 p-0 sm:h-7 sm:w-7 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 rounded cursor-pointer flex-shrink-0"
        title="Zoom Out (Ctrl+-)"
      >
        <ZoomOut size={10} className="sm:w-4 sm:h-4" />
      </Button>

      {isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleZoomInputSubmit}
          onKeyDown={handleZoomInputKeyDown}
          className="w-12 sm:w-14 h-6 text-xs text-center bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 rounded px-1"
          placeholder="10-400"
        />
      ) : (
        <button
          onClick={handleZoomClick}
          onDoubleClick={handleResetZoom}
          className="text-xs font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer px-1 sm:px-2 py-0.5 rounded hover:bg-white/10 dark:hover:bg-white/5 min-w-[2.5rem] sm:min-w-[3rem] text-center"
          title="Click to edit zoom, Double-click to reset"
        >
          {zoomLevel}%
        </button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="h-6 w-6 p-0 sm:h-7 sm:w-7 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 rounded cursor-pointer flex-shrink-0"
        title="Zoom In (Ctrl+=)"
      >
        <ZoomIn size={10} className="sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
}

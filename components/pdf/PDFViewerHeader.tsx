"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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

export interface PDFViewerHeaderProps {
  /** PDF document being viewed */
  pdfDocument: PDFDocument;
  /** Whether the header is visible */
  isHeaderVisible: boolean;
  /** Function to set header visibility */
  setIsHeaderVisible: (visible: boolean) => void;
  /** Whether focus mode is active */
  isFocusMode: boolean;
  /** Function to toggle focus mode */
  setIsFocusMode: (focusMode: boolean) => void;
  /** Currently selected tool */
  selectedTool: "highlight" | "nothing" | "comment" | "note" | "delete";
  /** Function to set selected tool */
  setSelectedTool: (
    tool: "highlight" | "nothing" | "comment" | "note" | "delete"
  ) => void;
  /** Current highlight mode */
  highlightMode: "quick" | "comment" | "note";
  /** Function to set highlight mode */
  setHighlightMode: (mode: "quick" | "comment" | "note") => void;
  /** Current highlight color */
  highlightColor: string;
  /** Function to set highlight color */
  setHighlightColor: (color: string) => void;
  /** PDF viewer reference for controlling zoom and navigation */
  pdfViewerRef?: React.RefObject<any>;
}

export function PDFViewerHeader({
  pdfDocument,
  isHeaderVisible,
  setIsHeaderVisible,
  isFocusMode,
  setIsFocusMode,
  selectedTool,
  setSelectedTool,
  highlightMode,
  setHighlightMode,
  highlightColor,
  setHighlightColor,
  pdfViewerRef,
}: PDFViewerHeaderProps) {
  const router = useRouter();

  // Predefined color options
  const colorOptions = [
    { name: "Yellow", value: "#FFFF00", bg: "bg-yellow-400" },
    { name: "Orange", value: "#FFA500", bg: "bg-orange-400" },
    { name: "Pink", value: "#FF69B4", bg: "bg-pink-400" },
    { name: "Green", value: "#00FF00", bg: "bg-green-400" },
    { name: "Blue", value: "#0080FF", bg: "bg-blue-400" },
    { name: "Purple", value: "#8A2BE2", bg: "bg-purple-400" },
    { name: "Red", value: "#FF0000", bg: "bg-red-400" },
    { name: "Cyan", value: "#00FFFF", bg: "bg-cyan-400" },
  ];

  // Get current color info
  const getCurrentColorInfo = () => {
    const colorInfo = colorOptions.find(c => c.value === highlightColor);
    return colorInfo || { name: "Custom", value: highlightColor, bg: "" };
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-20 transition-all duration-500 ease-in-out ${
        !isHeaderVisible
          ? "-translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      }`}
    >
      {/* Enhanced stylish header with glassmorphism effect */}
      <div className="bg-white dark:bg-background backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
        <div className="bg-gradient-to-r from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl">
          <div className="flex items-center justify-between px-4 sm:px-6 py-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* PDF Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <FileText size={14} className="text-white" />
                </div>
                <h1 className="text-xs font-semibold text-foreground truncate">
                  {pdfDocument.filename}
                </h1>
              </div>

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Page Navigation */}
              <PageNavigation pdfViewerRef={pdfViewerRef} />

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Zoom Controls */}
              <ZoomControls pdfViewerRef={pdfViewerRef} />

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Color Picker Section */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white/30 shadow-sm"
                      style={{ backgroundColor: highlightColor }}
                    />
                    <span className="hidden sm:inline text-xs font-medium">
                      {getCurrentColorInfo().name}
                    </span>
                    <ChevronDown size={14} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="bottom"
                  sideOffset={8}
                  className="w-64 dark:bg-black bg-white mt-1 border border-white/20 dark:border-white/10 rounded-lg z-[9999]"
                >
                  <div className="p-3">
                    <div className="text-xs font-medium text-foreground/80 mb-3">
                      Choose Highlight Color
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setHighlightColor(color.value)}
                          className={`w-12 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                            highlightColor === color.value
                              ? "border-foreground shadow-lg"
                              : "border-white/30 dark:border-white/20 hover:border-foreground/50"
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Tools Section */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                  >
                    <Palette size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      Tools
                    </span>
                    {selectedTool && (
                      <div className="flex items-center gap-1">
                        {selectedTool === "highlight" && (
                          <div
                            className="w-2 h-2 rounded-full border border-white/30"
                            style={{ backgroundColor: highlightColor }}
                          />
                        )}
                        {selectedTool === "delete" && (
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                        )}
                        {selectedTool === "nothing" && (
                          <div className="w-2 h-2 rounded-full bg-black/50" />
                        )}
                      </div>
                    )}
                    <ChevronDown size={14} className="opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="bottom"
                  sideOffset={8}
                  className="w-56 dark:bg-black bg-white mt-1 order border-white/20 dark:border-white/10   rounded-lg z-[9999]"
                >
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center gap-3 hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 data-[state=open]:bg-black/10 dark:data-[state=open]:bg-white/10 transition-colors duration-200">
                      <Highlighter size={16} className="text-yellow-500" />
                      <span className="font-medium">Highlighting</span>
                      {selectedTool === "highlight" && (
                        <Circle
                          size={6}
                          className="ml-auto text-blue-500 fill-current"
                        />
                      )}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent
                      className="w-64 bg-white dark:bg-black backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30 rounded-xl z-[99999]"
                      sideOffset={8}
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTool("highlight");
                          setHighlightMode("quick");
                          console.log(
                            "Quick highlight selected - Tool:",
                            "highlight",
                            "Mode:",
                            "quick"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm border border-white/30"
                          style={{ backgroundColor: highlightColor }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Quick Highlight
                          </div>
                          <div className="text-xs text-muted-foreground">
                            No note, just color
                          </div>
                        </div>
                        {highlightMode === "quick" &&
                          selectedTool === "highlight" && (
                            <Circle
                              size={6}
                              className="text-blue-500 fill-current"
                            />
                          )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTool("highlight");
                          setHighlightMode("comment");
                          console.log(
                            "Comment highlight selected - Tool:",
                            "highlight",
                            "Mode:",
                            "comment"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm border border-white/30"
                          style={{ backgroundColor: highlightColor }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            Inline Comment
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Small text on hover
                          </div>
                        </div>
                        {highlightMode === "comment" &&
                          selectedTool === "highlight" && (
                            <Circle
                              size={6}
                              className="text-blue-500 fill-current"
                            />
                          )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTool("highlight");
                          setHighlightMode("note");
                          console.log(
                            "Note highlight selected - Tool:",
                            "highlight",
                            "Mode:",
                            "note"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm border border-white/30"
                          style={{ backgroundColor: highlightColor }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Linked Note</div>
                          <div className="text-xs text-muted-foreground">
                            Expands to full note
                          </div>
                        </div>
                        {highlightMode === "note" &&
                          selectedTool === "highlight" && (
                            <Circle
                              size={6}
                              className="text-blue-500 fill-current"
                            />
                          )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTool("delete");
                      console.log("Delete tool selected - Tool:", "delete");
                    }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20 transition-colors duration-200"
                  >
                    <Trash2 size={16} className="text-red-500" />
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Delete Highlights
                    </span>
                    {selectedTool === "delete" && (
                      <Circle
                        size={6}
                        className="ml-auto text-blue-500 fill-current"
                      />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTool("nothing");
                      console.log("Nothing tool selected - Tool:", "nothing");
                    }}
                    className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                  >
                    <CircleSlash2 size={16} />
                    <span className="font-medium">Nothing</span>
                    {selectedTool === "nothing" && (
                      <Circle
                        size={6}
                        className="ml-auto text-blue-500 fill-current"
                      />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Current Tool Indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 dark:bg-white/5 rounded-md backdrop-blur-sm border border-white/20 dark:border-white/10">
                {selectedTool === "highlight" && (
                  <>
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm border border-white/30"
                      style={{ backgroundColor: highlightColor }}
                    />
                    <span className="text-xs font-medium text-foreground/80">
                      {highlightMode === "quick"
                        ? "Quick"
                        : highlightMode === "comment"
                        ? "Comment"
                        : "Note"}
                    </span>
                  </>
                )}
                {selectedTool === "delete" && (
                  <>
                    <Trash2 size={10} className="text-red-500" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Delete
                    </span>
                  </>
                )}
                {selectedTool === "nothing" && (
                  <>
                    <CircleSlash2 size={10} />
                    <span className="text-xs font-medium text-foreground/80">
                      Nothing
                    </span>
                  </>
                )}
              </div>

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Focus Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsFocusMode(!isFocusMode);
                  setIsHeaderVisible(false);
                }}
                className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                title={
                  isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode (F)"
                }
              >
                {isFocusMode ? (
                  <>
                    <Minimize size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      Exit Focus
                    </span>
                  </>
                ) : (
                  <>
                    <Maximize size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      Focus Mode
                    </span>
                  </>
                )}
              </Button>

              {/* Hide Header Button (only show in focus mode when header is visible) */}
              {isFocusMode && (
                <>
                  <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHeaderVisible(false)}
                    className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                    title="Hide Header"
                  >
                    <ArrowLeft size={14} className="-rotate-90" />
                    <span className="hidden sm:inline text-xs font-medium">
                      Hide
                    </span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page Navigation Component
function PageNavigation({ pdfViewerRef }: { pdfViewerRef?: React.RefObject<any> }) {
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
    <div className="flex items-center gap-2">
      {isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputSubmit}
          onKeyDown={handleInputKeyDown}
          className="w-12 h-6 text-xs text-center bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 rounded px-1"
        />
      ) : (
        <button
          onClick={handlePageClick}
          className="text-xs font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-white/10 dark:hover:bg-white/5"
        >
          {currentPage}
        </button>
      )}
      <span className="text-xs text-foreground/60">/</span>
      <span className="text-xs font-medium text-foreground/80">
        {totalPages}
      </span>
    </div>
  );
}

// Zoom Controls Component
function ZoomControls({ pdfViewerRef }: { pdfViewerRef?: React.RefObject<any> }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("100");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update zoom level from PDF viewer
  React.useEffect(() => {
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
    if (pdfViewerRef?.current) {
      try {
        if (pdfViewerRef.current.magnification) {
          pdfViewerRef.current.magnification.zoomIn();
        } else {
          // Fallback method
          pdfViewerRef.current.zoomIn();
        }
      } catch (error) {
        console.error("Error zooming in:", error);
      }
    }
  };

  const handleZoomOut = () => {
    if (pdfViewerRef?.current) {
      try {
        if (pdfViewerRef.current.magnification) {
          pdfViewerRef.current.magnification.zoomOut();
        } else {
          // Fallback method
          pdfViewerRef.current.zoomOut();
        }
      } catch (error) {
        console.error("Error zooming out:", error);
      }
    }
  };

  const handleResetZoom = () => {
    if (pdfViewerRef?.current) {
      try {
        if (pdfViewerRef.current.magnification) {
          pdfViewerRef.current.magnification.fitToPage();
        } else {
          // Fallback method
          pdfViewerRef.current.fitToPage();
        }
      } catch (error) {
        console.error("Error resetting zoom:", error);
      }
    }
  };

  const handleZoomClick = () => {
    setIsEditing(true);
    setInputValue(zoomLevel.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleZoomInputSubmit = () => {
    const zoomValue = parseInt(inputValue);
    if (zoomValue >= 10 && zoomValue <= 400 && pdfViewerRef?.current) {
      try {
        // Use Syncfusion's magnification API to set custom zoom
        if (pdfViewerRef.current.magnification) {
          pdfViewerRef.current.magnification.zoomTo(zoomValue);
        } else {
          // Fallback method
          pdfViewerRef.current.zoomTo(zoomValue);
        }
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
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 rounded"
        title="Zoom Out"
      >
        <ZoomOut size={12} />
      </Button>

      {isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleZoomInputSubmit}
          onKeyDown={handleZoomInputKeyDown}
          className="w-14 h-6 text-xs text-center bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 rounded px-1"
          placeholder="10-400"
        />
      ) : (
        <button
          onClick={handleZoomClick}
          onDoubleClick={handleResetZoom}
          className="text-xs font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-white/10 dark:hover:bg-white/5 min-w-[3rem] text-center"
          title="Click to edit zoom (10-400%), Double-click to reset"
        >
          {zoomLevel}%
        </button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="h-6 w-6 p-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 rounded"
        title="Zoom In"
      >
        <ZoomIn size={12} />
      </Button>
    </div>
  );
}

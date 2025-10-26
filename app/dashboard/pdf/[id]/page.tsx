"use client";

/**
 * PDF Viewer Page
 *
 * Dynamic route for viewing individual PDFs with annotation functionality.
 * Uses the PDFAnnotationViewer component to handle PDF display and interactions.
 */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetPDFQuery } from "@/lib/store/apiSlice";
import PDFAnnotationViewer from "@/components/pdf/PDFAnnotationViewer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  RefreshCw,
  Maximize,
  Minimize,
  Palette,
  ChevronDown,
  Highlighter,
  MessageSquare,
  FileEdit,
  Circle,
  CircleSlash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

export default function PDFViewerPage() {
  const params = useParams();
  const router = useRouter();
  const pdfId = params.id as string;
  const [isFocusMode, setIsFocusMode] = useState(true); // Start in focus mode by default
  const [showHint, setShowHint] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false); // Header hidden by default in focus mode
  const [selectedTool, setSelectedTool] = useState<
    "highlight" | "nothing" | "comment" | "note"
  >("nothing"); // Default tool
  const [highlightMode, setHighlightMode] = useState<
    "quick" | "comment" | "note"
  >("quick"); // Default highlight mode

  // Debug logging for tool state changes
  useEffect(() => {
    console.log(
      "Tool state changed - selectedTool:",
      selectedTool,
      "highlightMode:",
      highlightMode
    );
  }, [selectedTool, highlightMode]);
  // Keyboard shortcut for focus mode (F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F key for focus mode
      if (event.key === "f" || event.key === "F") {
        // Only if not typing in an input
        if (
          !["INPUT", "TEXTAREA"].includes(
            (event.target as HTMLElement)?.tagName
          )
        ) {
          event.preventDefault();
          setIsFocusMode(!isFocusMode);
        }
      }
      // Escape to exit focus mode
      else if (event.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  // Show hint when first opening (since we start in focus mode)
  useEffect(() => {
    if (isFocusMode) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 4000); // Show longer for first time
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch PDF data
  const {
    data: pdfDocument,
    error,
    isLoading,
    refetch,
  } = useGetPDFQuery(pdfId, {
    skip: !pdfId,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={40}
            className="text-primary mx-auto mb-4 animate-spin"
          />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Loading PDF...
          </h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your document
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !pdfDocument) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={40} className="text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            PDF Not Found
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The PDF you're looking for could not be found or you don't have
            permission to view it.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Button>
            <Button
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>

      <div
        className={`min-h-screen bg-background focus-mode-transition pdf-viewer-page ${
          isFocusMode ? "pdf-focus-mode" : ""
        }`}
        data-pdf-viewer="true"
      >
        {/* Floating Header */}
        <div
          className={`fixed top-4 left-4 right-4 z-20 transition-all duration-500 ease-in-out ${
            !isHeaderVisible
              ? "-translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          {/* Enhanced stylish header with glassmorphism effect */}
          <div className="bg-white dark:bg-black backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
            <div className="bg-gradient-to-r from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl">
              <div className="flex items-center justify-between px-4 sm:px-6 py-2">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 h-7 px-2 rounded-lg backdrop-blur-sm"
                  >
                    <ArrowLeft size={14} />
                    <span className="hidden sm:inline text-xs font-medium">
                      Back
                    </span>
                  </Button>

                  {/* Separator */}
                  <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

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
                                className={`w-2 h-2 rounded-full ${
                                  highlightMode === "quick"
                                    ? "bg-yellow-400"
                                    : highlightMode === "comment"
                                    ? "bg-orange-400"
                                    : "bg-blue-400"
                                }`}
                              />
                            )}
                            {selectedTool === "comment" && (
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                            )}
                            {selectedTool === "note" && (
                              <div className="w-2 h-2 rounded-full bg-purple-400" />
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
                            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm" />
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
                            <div className="w-4 h-4 bg-orange-400 rounded-full shadow-sm" />
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
                            <div className="w-4 h-4 bg-blue-400 rounded-full shadow-sm" />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                Linked Note
                              </div>
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
                          setSelectedTool("comment");
                          console.log(
                            "Comment tool selected - Tool:",
                            "comment"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <MessageSquare size={16} className="text-green-500" />
                        <span className="font-medium">Comments</span>
                        {selectedTool === "comment" && (
                          <Circle
                            size={6}
                            className="ml-auto text-blue-500 fill-current"
                          />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTool("note");
                          console.log("Note tool selected - Tool:", "note");
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <FileEdit size={16} className="text-purple-500" />
                        <span className="font-medium">Notes</span>
                        {selectedTool === "note" && (
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
                          console.log(
                            "Quick highlight selected - Tool:",
                            "nothing"
                          );
                        }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/10 dark:focus:bg-white/10 transition-colors duration-200"
                      >
                        <CircleSlash2 />
                        <span className="font-medium">nothing</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Current Tool Indicator */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 dark:bg-white/5 rounded-md backdrop-blur-sm border border-white/20 dark:border-white/10">
                    {selectedTool === "highlight" && (
                      <>
                        <div
                          className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                            highlightMode === "quick"
                              ? "bg-yellow-400"
                              : highlightMode === "comment"
                              ? "bg-orange-400"
                              : "bg-blue-400"
                          }`}
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
                    {selectedTool === "comment" && (
                      <>
                        <MessageSquare size={10} className="text-green-500" />
                        <span className="text-xs font-medium text-foreground/80">
                          Comment
                        </span>
                      </>
                    )}
                    {selectedTool === "note" && (
                      <>
                        <FileEdit size={10} className="text-purple-500" />
                        <span className="text-xs font-medium text-foreground/80">
                          Note
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
                      isFocusMode
                        ? "Exit Focus Mode (Esc)"
                        : "Enter Focus Mode (F)"
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

        {/* Show Header Button (appears when header is hidden in focus mode) */}
        {isFocusMode && !isHeaderVisible && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30 cursor-pointer">
            <Button
              onClick={() => setIsHeaderVisible(true)}
              size="sm"
              className="bg-white/90 dark:bg-background/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full px-4 py-2 animate-fade-in transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-background shadow-lg"
            >
              <ArrowLeft size={16} className="rotate-90 text-gray-700 dark:text-gray-300" />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Header
              </span>
            </Button>
          </div>
        )}

        {/* PDF Viewer - Full viewport height with explicit top/bottom to avoid bottom gap */}
        <div
          className={`transition-all duration-300 ease-in-out fixed z-0`}
          style={{
            top: 0,
            bottom: 0,
            left: isFocusMode ? 0 : 256, // px - leave room for sidebar when not focused
            width: isFocusMode ? "100vw" : "calc(100vw - 256px)",
            overflow: "hidden",
          }}
        >
          <div className="w-full h-full">
            <PDFAnnotationViewer
              pdfDocument={pdfDocument}
              className="w-full h-full"
              selectedTool={selectedTool}
              highlightMode={highlightMode}
            />
          </div>
        </div>

        {/* Enter Focus Mode Button (when not in focus mode) */}
        {!isFocusMode && (
          <div className="fixed bottom-6 right-6 z-30">
            <Button
              onClick={() => setIsFocusMode(true)}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white shadow-2xl shadow-blue-500/25 dark:shadow-blue-600/20 rounded-full px-4 py-2 hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 transition-all duration-200 backdrop-blur-sm border border-white/20 dark:border-gray-700/30"
            >
              <Maximize size={16} className="mr-2" />
              <span className="font-medium">Focus Mode</span>
            </Button>
          </div>
        )}

        {/* Focus Mode Hint */}
        {isFocusMode && showHint && (
          <div className="fixed bottom-4 transform right-2 translate-x-1/2 bg-card/95 backdrop-blur-sm border border-border text-foreground px-4 py-3 rounded-lg shadow-xl z-50 text-sm animate-fade-in">
            <div className="text-center">
              <p className="font-medium mb-1">Welcome to Focus Mode</p>
              <p className="text-muted-foreground">
                Press{" "}
                <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono">
                  Esc
                </kbd>{" "}
                or click "Exit Focus" to return to normal view
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

/**
 * PDF Viewer Page
 *
 * Dynamic route for viewing individual PDFs with annotation functionality.
 * Uses the PDFAnnotationViewer component to handle PDF display and interactions.
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetPDFQuery } from "@/lib/store/apiSlice";
import { PDFAnnotationViewer, PDFViewerHeader } from "@/components/pdf";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, RefreshCw, Maximize } from "lucide-react";

export default function PDFViewerPage() {
  const params = useParams();
  const router = useRouter();
  const pdfId = params.id as string;
  const [isFocusMode, setIsFocusMode] = useState(true); // Start in focus mode by default
  const [showHint, setShowHint] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false); // Header hidden by default in focus mode
  const [selectedTool, setSelectedTool] = useState<
    "highlight" | "nothing" | "comment" | "note" | "delete"
  >("nothing"); // Default tool
  const [highlightMode, setHighlightMode] = useState<
    "quick" | "comment" | "note"
  >("quick"); // Default highlight mode
  const [highlightColor, setHighlightColor] = useState("#FFFF00"); // Default yellow color

  // PDF viewer ref for controlling zoom and navigation
  const pdfViewerRef = useRef<any>(null);

  // Debug logging for tool state changes
  useEffect(() => {
    console.log(
      "Tool state changed - selectedTool:",
      selectedTool,
      "highlightMode:",
      highlightMode,
      "highlightColor:",
      highlightColor
    );
  }, [selectedTool, highlightMode, highlightColor]);

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
        <PDFViewerHeader
          pdfDocument={pdfDocument}
          isHeaderVisible={isHeaderVisible}
          setIsHeaderVisible={setIsHeaderVisible}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          highlightMode={highlightMode}
          setHighlightMode={setHighlightMode}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          pdfViewerRef={pdfViewerRef}
        />

        {/* Show Header Button (appears when header is hidden in focus mode) */}
        {isFocusMode && !isHeaderVisible && (
          <div className="fixed top-4 left-1/2 transform  z-30 cursor-pointer">
            <Button
              onClick={() => setIsHeaderVisible(true)}
              size="sm"
              className="bg-white/80 dark:bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl px-4 py-2 animate-fade-in transition-all duration-300 hover:scale-105 hover:bg-white/90 dark:hover:bg-background/90 shadow-2xl shadow-black/10 dark:shadow-black/30"
            >
              <div className="bg-gradient-to-r from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl -m-2 p-2">
                <div className="flex items-center gap-2">
                  <ArrowLeft
                    size={16}
                    className="rotate-90 text-foreground/80"
                  />
                  <span className="text-sm font-medium text-foreground">
                    Show Header
                  </span>
                  <kbd className="ml-1 px-1.5 py-0.5 text-xs font-mono bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded text-foreground/60">
                    Alt+H
                  </kbd>
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* Current Tool Indicator (top right, only visible when header is hidden) */}
        {!isHeaderVisible && (
          <div className="fixed top-4 right-4 z-30">
            <div className="bg-white/80 dark:bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl px-3 py-2 animate-fade-in shadow-lg shadow-black/5 dark:shadow-black/20">
              <div className="flex items-center gap-2">
                {selectedTool === "highlight" && (
                  <>
                    <div
                      className="w-3 h-3 rounded-full shadow-sm border border-white/30"
                      style={{ backgroundColor: highlightColor }}
                    />
                    <span className="text-xs font-medium text-foreground/80">
                      {highlightMode === "quick"
                        ? "Quick Highlight"
                        : highlightMode === "comment"
                        ? "Inline Comment"
                        : "Linked Note"}
                    </span>
                  </>
                )}
                {selectedTool === "delete" && (
                  <>
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">
                      Delete Mode
                    </span>
                  </>
                )}
                {selectedTool === "nothing" && (
                  <>
                    <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 shadow-sm" />
                    <span className="text-xs font-medium text-foreground/80">
                      Selection Only
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer - Full viewport height with explicit top/bottom to avoid bottom gap */}
        <div
          className={`transition-all duration-300 ease-in-out fixed z-0`}
          style={{
            top: 0,
            bottom: 0,
            left: 0,
            width: "100vw",
            overflow: "hidden",
          }}
        >
          <div className="w-full h-full">
            <PDFAnnotationViewer
              pdfDocument={pdfDocument}
              className="w-full h-full"
              selectedTool={selectedTool}
              highlightMode={highlightMode}
              highlightColor={highlightColor}
              externalRef={pdfViewerRef}
            />
          </div>
        </div>

        {/* Enter Focus Mode Button (when not in focus mode) */}
        {!isFocusMode && (
          <div className="fixed bottom-6 right-6 z-30">
            <Button
              onClick={() => setIsFocusMode(true)}
              size="sm"
              className="dark:text-white dark:bg-background bg-white text-black shadow-2xl shadow-blue-500/25 dark:shadow-blue-600/20 rounded-full px-4 py-2 transition-all duration-200 backdrop-blur-sm border border-gray-200 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-800 dark:border-gray-700/30"
            >
              <Maximize size={16} className="mr-2" />
              <span className="font-medium">Focus Mode</span>
              <div className="ml-2 px-2 py-1 bg-gray-100 dark:bg-background rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                Ctrl+F
              </div>
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

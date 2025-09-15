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
} from "lucide-react";

export default function PDFViewerPage() {
  const params = useParams();
  const router = useRouter();
  const pdfId = params.id as string;
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Keyboard shortcut for focus mode (F11 or F)
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

  // Show hint when entering focus mode
  useEffect(() => {
    if (isFocusMode) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFocusMode]);

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
    <div
      className={`min-h-screen bg-background focus-mode-transition pdf-viewer-page ${isFocusMode ? "pdf-focus-mode" : ""
        }`}
      data-pdf-viewer="true"
    >
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 bg-muted/20 rounded-lg px-3 py-2 border border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1 sm:gap-2 flex-shrink-0 hover:bg-background/80 transition-colors h-7 px-2"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline text-sm">Back</span>
            </Button>
            <div className="w-px h-5 bg-border flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-white" />
              </div>
              <h1 className="text-sm font-semibold text-foreground truncate">
                {pdfDocument.filename}
              </h1>
            </div>
            <div className="w-px h-5 bg-border flex-shrink-0" />
            {/* Focus Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="flex items-center gap-1 sm:gap-2 flex-shrink-0 focus-mode-button hover:bg-background/80 transition-colors h-7 px-2"
              title={
                isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode (F)"
              }
            >
              {isFocusMode ? (
                <>
                  <Minimize size={14} />
                  <span className="hidden sm:inline text-sm">Exit Focus</span>
                </>
              ) : (
                <>
                  <Maximize size={14} />
                  <span className="hidden sm:inline text-sm">Focus Mode</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className={`h-[calc(100vh-49px)] w-full max-w-full overflow-hidden ${isFocusMode ? "!w-screen max-w-none" : "w-full max-w-full"
          }`}
      >
        <PDFAnnotationViewer
          pdfDocument={pdfDocument}
          className="w-full h-full max-w-full"
        />
      </div>

      {/* Focus Mode Hint */}
      {isFocusMode && showHint && (
        <div className="focus-mode-hint bg-card border border-border text-foreground px-3 py-1.5 rounded-md shadow-lg z-50 text-sm">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs font-mono">Esc</kbd> to
          exit focus mode
        </div>
      )}
    </div>
  );
}

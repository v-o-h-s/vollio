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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={48}
            className="text-blue-500 mx-auto mb-4 animate-spin"
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading PDF...
          </h2>
          <p className="text-gray-600">
            Please wait while we load your document
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !pdfDocument) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            PDF Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The PDF you're looking for could not be found or you don't have
            permission to view it.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-white focus-mode-transition pdf-viewer-page ${
        isFocusMode ? "pdf-focus-mode" : ""
      }`}
      data-pdf-viewer="true"
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText size={18} className="text-gray-500 flex-shrink-0" />
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                {pdfDocument.filename}
              </h1>
            </div>
          </div>

          {/* Focus Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="flex items-center gap-1 sm:gap-2 flex-shrink-0 focus-mode-button"
            title={
              isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Focus Mode (F)"
            }
          >
            {isFocusMode ? (
              <>
                <Minimize size={16} />
                <span className="hidden sm:inline">Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize size={16} />
                <span className="hidden sm:inline">Focus Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className={`h-[calc(100vh-57px)] sm:h-[calc(100vh-65px)] w-full max-w-full overflow-hidden ${
          isFocusMode ? "w-screen max-w-none !w-screen" : "w-full max-w-full"
        }`}
      >
        <PDFAnnotationViewer
          pdfDocument={pdfDocument}
          className="w-full h-full max-w-full"
        />
      </div>

      {/* Focus Mode Hint */}
      {isFocusMode && showHint && (
        <div className="focus-mode-hint">
          Press{" "}
          <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> to
          exit focus mode
        </div>
      )}
    </div>
  );
}

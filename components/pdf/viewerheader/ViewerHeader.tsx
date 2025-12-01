"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Home } from "lucide-react";
import { PDFDocument } from "@/lib/types/pdf";
import { PageNavigation } from "./PageNavigation";
import { ZoomControls } from "./ZoomControls";
import { HighlightColorSelector } from "./HighlightColorSelector";

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
  /** Width of the viewer (for responsive header) */
  viewerWidth?: string;
}

export function ViewerHeader({
  pdfDocument,
  isHeaderVisible,
  setIsHeaderVisible,
  onToggleNoter,
  pdfViewerRef,
  currentHighlightColor = "#FFEB3B",
  onHighlightColorChange,
  viewerWidth = "100%",
}: PDFViewerHeaderProps) {
  const router = useRouter();

  const handleColorChange = (color: string) => {
    if (onHighlightColorChange) {
      onHighlightColorChange(color);
    }
  };

  return (
    <div
      className={`absolute top-4 left-1/2 z-20 transition-all duration-500 ease-in-out ${
        !isHeaderVisible
          ? "-translate-y-full -translate-x-1/2 opacity-0"
          : "-translate-x-1/2 translate-y-0 opacity-100"
      }`}
      style={{ width: `calc(${viewerWidth} - 0.5rem)` }}
    >
      {/* Enhanced stylish header with glassmorphism effect */}
      <div className="bg-white dark:bg-background backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30">
        <div className="bg-gradient-to-r from-white/5 to-transparent dark:from-white/5 dark:to-transparent rounded-2xl">
          <div className="flex items-center justify-between px-4 sm:px-2 py-2">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/pdfs")}
                className="cursor-pointer"
              >
                <Home size={12} />
              </Button>

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

              {/* Highlight Color Selector */}
              <HighlightColorSelector
                currentColor={currentHighlightColor}
                onColorChange={handleColorChange}
              />

              {/* Separator */}
              <div className="w-px h-5 bg-white/20 dark:bg-white/10 flex-shrink-0" />

              {/* Noter Toggle */}
              <Button variant="ghost" size="sm" onClick={onToggleNoter}>
                <span className="flex items-center gap-1 cursor-pointer">
                  <FileText size={12} />
                  <span className="text-xs">Notes</span>
                </span>
              </Button>

              {/* Hide Header Button */}
              <Button
                className="cursor-pointer"
                variant="ghost"
                size="sm"
                onClick={() => setIsHeaderVisible(false)}
              >
                <span className="flex items-center gap-1 cursor-pointer">
                  <Eye size={12} />
                  <span className="text-xs">Hide Header</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

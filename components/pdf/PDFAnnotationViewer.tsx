// TODO pls update the any types to proper types from Syncfusion if possible
import React, { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PdfViewerComponent,
  Inject,
  TextSelection,
  TextSearch,
  Navigation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  Annotation,
} from "@syncfusion/ej2-react-pdfviewer";
import { useGetPDFQuery } from "@/lib/store/apiSlice";
import { PDFDocument, TextBounds } from "@/lib/types/pdf";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PDFViewerFallback } from "@/components/pdf/FallbackUI";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";

import { HighlightSettings } from "@syncfusion/ej2-react-pdfviewer";
import { NoteCreationModal } from "./NoteCreationModal";
import { HighlightHoverToolbar } from "./HighlightHoverToolbar";
import { NotePreviewModal } from "./NotePreviewModal";

/**
 * this is the options we need most <3I
{
  bounds: Bounds[];
  pageNumber: number;
  opacity: number;
  color: string;
}
 */

/**
 * Props interface for PDFAnnotationViewer component
 */
export interface PDFAnnotationViewerProps {
  /** PDF document to display - can be null for loading state */
  pdfDocument: PDFDocument | null;
  /** Additional CSS classes */
  className?: string;
  /** Currently selected annotation tool */
  selectedTool: "highlight" | "nothing" | "comment" | "note";
  /** Current highlight mode when highlight tool is selected */
  highlightMode?: "quick" | "comment" | "note";
}

interface TextSelectionCompleteEventArgs {
  textContent: string; // the actual selected text
  pageIndex: number; // the page where the selection happened
  element: HTMLElement; // the text layer element
  textBounds: any[]; // array of bounding boxes (x, y, width, height for each fragment)
}

/**
 * Main PDFAnnotationViewer Component
 */

const PDFAnnotationViewer: React.FC<PDFAnnotationViewerProps> = ({
  pdfDocument,
  className = "",
  selectedTool = "highlight",
  highlightMode = "quick",
}) => {
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [annotationsLoaded, setAnnotationsLoaded] = useState(false);

  // Text selection and toolbar state
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionBounds, setSelectionBounds] = useState<TextBounds | null>(
    null
  );
  const [selectedTextBounds, setSelectedTextBounds] = useState<any[] | null>(
    null
  );
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);

  // Highlight hover state
  const [hoveredHighlight, setHoveredHighlight] = useState<{
    noteId: string;
    position: { x: number; y: number };
    noteTitle?: string;
  } | null>(null);
  const [showHoverToolbar, setShowHoverToolbar] = useState(false);
  const [showNotePreview, setShowNotePreview] = useState(false);
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);

  // Component refs
  const pdfViewerRef = useRef<PdfViewerComponent>(null);

  // Hooks
  const router = useRouter();

  // Get fresh PDF data with signed URL if we have a PDF ID
  const {
    data: freshPdfData,
    error: pdfError,
    isLoading: isPdfLoading,
    refetch: refetchPdf,
  } = useGetPDFQuery(pdfDocument?.id || "", {
    skip: !pdfDocument?.id,
    // Refetch every 30 minutes to get fresh signed URLs
    pollingInterval: 30 * 60 * 1000,
  });

  // Use fresh PDF data if available, otherwise use prop data
  const currentPdfData = freshPdfData || pdfDocument;

  // Configure resource URL for Syncfusion PDF Viewer
  const resourceUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/lib`
      : "/lib";

  // extracting the selection bounds - Syncfusion expects bounds in a specific format
  const extractSelectionBounds = (
    args: TextSelectionCompleteEventArgs
  ): any[] => {
    // Syncfusion expects bounds as an array of objects with left, top, width, height
    return args.textBounds.map((b: any) => ({
      x: b.left || b.x || 0,
      y: b.top || b.y || 0,
      width: b.width || b.right - b.left || 0,
      height: b.height || b.bottom - b.top || 0,
    }));
  };

  /* Text Selection Handlers */
  const handleSelectionTextEnd = useCallback(
    (args: TextSelectionCompleteEventArgs) => {
      // Validate input parameters first
      if (!args || !args.textContent || !args.textContent.trim()) {
        return;
      }

      // Validate textBounds array
      if (
        !args.textBounds ||
        !Array.isArray(args.textBounds) ||
        args.textBounds.length === 0
      ) {
        console.warn("Invalid textBounds array in text selection:", args);
        return;
      }

      // Extract text bounds from the selection event
      const textBounds = extractSelectionBounds(args);
      const selectedTextContent = args.textContent.trim();
      const pageNumber = args.pageIndex

      // Store selection data
      setSelectedText(selectedTextContent);
      setSelectedTextBounds(textBounds as any);
      setCurrentPageNumber(pageNumber);

      if (selectedTool === "highlight") {
        switch (highlightMode) {
          case "quick":
            try {
              console.log(pageNumber);
              const annotationOptions: Partial<HighlightSettings> = {
                bounds: textBounds,
                pageNumber: pageNumber, // Syncfusion uses 1-based page numbers
                author: "User",
                subject: "Quick Highlight",
                annotationSelectorSettings: {},
                color: "#FFFF00", // Yellow for quick highlights
                opacity: 0.4,
                enableMultiPageAnnotation: false,
                enableTextMarkupResizer: true,
                customData: {
                  id: `quick-highlight-${Date.now()}`,
                  type: "quick",
                  text: selectedTextContent,
                },
                isLock: false,
                isPrint: true,
              };

              pdfViewerRef.current?.annotation.addAnnotation(
                "Highlight",
                annotationOptions as HighlightSettings
              );

              // Clear selection after quick highlight
              setSelectedText("");
              setSelectionBounds(null);
              setSelectedTextBounds(null);
            } catch (error) {
              console.error("Error creating quick highlight:", error);
            }
            break;

          case "comment":
            // TODO: Implement comment mode

            break;

          case "note":
            // Store selection data for note creation
            setShowNoteModal(true);
            break;

          default:
            console.warn("Unknown highlight mode:", highlightMode);
        }
      }

      // try {
      //   // Validate input parameters first before resetting any state
      //   if (
      //     !currentPdfData ||
      //     !args ||
      //     !args.textContent ||
      //     !args.textContent.trim()
      //   ) {
      //     return;
      //   }

      //   // Validate textBounds array
      //   if (
      //     !args.textBounds ||
      //     !Array.isArray(args.textBounds) ||
      //     args.textBounds.length === 0
      //   ) {
      //     console.warn("Invalid textBounds array in text selection:", args);
      //     return;
      //   }

      //   // Calculate overall selection bounds

      //   const left = Math.min(...args.textBounds.map((b: any) => b.left));
      //   const right = Math.max(...args.textBounds.map((b: any) => b.right));
      //   const top = Math.min(...args.textBounds.map((b: any) => b.top));
      //   const bottom = Math.max(...args.textBounds.map((b: any) => b.bottom));

      //   const x = left;
      //   const y = top;
      //   const width = right - left;
      //   const height = bottom - top;

      //   // Validate page index
      //   if (typeof args.pageIndex !== "number" || args.pageIndex < 0) {
      //     console.warn("Invalid page index in text selection:", args.pageIndex);
      //     return;
      //   }

      //   // Store selection data
      //   const textContent = args.textContent.trim();

      //   // Set new state (don't clear showSelectionToolbar as it causes flicker)
      //   setSelectedText(textContent);
      //   setCurrentPageNumber(args.pageIndex); // Convert PDF coordinates to screen coordinates
      //   let screenX = x + width / 2;
      //   let screenY = y - 10;

      //   // Convert PDF coordinates to screen coordinates using Syncfusion's coordinate system
      //   if (pdfViewerRef.current) {
      //     try {
      //       // Use Syncfusion's built-in coordinate conversion if available
      //       const viewer = pdfViewerRef.current;

      //       // Get the PDF viewer container element
      //       const viewerElement = viewer.element;
      //       if (viewerElement) {
      //         // Look for the page canvas or page container
      //         const pageCanvas =
      //           viewerElement.querySelector(
      //             `canvas[id*="${args.pageIndex}"]`
      //           ) ||
      //           viewerElement.querySelector(".e-pv-page-canvas") ||
      //           viewerElement.querySelector(`#pagecanvas_${args.pageIndex}`);

      //         if (pageCanvas) {
      //           const canvasRect = pageCanvas.getBoundingClientRect();

      //           // Convert PDF coordinates to screen coordinates using canvas position
      //           screenX = canvasRect.left + x + width / 2;
      //           screenY = canvasRect.top + y - 10;
      //         } else {
      //           // Fallback to viewer element
      //           const viewerRect = viewerElement.getBoundingClientRect();
      //           screenX = viewerRect.left + x + width / 2;
      //           screenY = viewerRect.top + y - 10;
      //         }
      //       }
      //     } catch (error) {
      //       console.warn(
      //         "Could not convert PDF coordinates to screen coordinates:",
      //         error
      //       );
      //       // Ultimate fallback to original coordinates
      //       screenX = x + width / 2;
      //       screenY = y - 10;
      //     }
      //   }

      //   // Ensure tooltip stays within viewport bounds
      //   const viewportWidth = window.innerWidth;
      //   const viewportHeight = window.innerHeight;

      //   // Adjust if tooltip would go off screen
      //   if (screenX > viewportWidth - 200) {
      //     screenX = viewportWidth - 200;
      //   }
      //   if (screenX < 10) {
      //     screenX = 10;
      //   }
      //   if (screenY < 10) {
      //     screenY = screenY + height + 20; // Position below if too close to top
      //   }
      //   if (screenY > viewportHeight - 100) {
      //     screenY = screenY - 60; // Position above if too close to bottom
      //   }

      //   // Store selection bounds for highlight creation later
      //   const selectionBounds: TextBounds = {
      //     x,
      //     y,
      //     width,
      //     height,
      //   };

      //   // Set tooltip position and show it
      //   const tooltipPosition = {
      //     x: screenX,
      //     y: screenY,
      //   };

      //   // Update all state immediately in sync, but use a small delay to ensure clean transitions
      //   setSelectionBounds(selectionBounds);
      //   setTooltipPosition(tooltipPosition);
      // } catch (error) {
      //   console.error("Error handling text selection:", error);
      // }
    },
    [
      selectedTool,
      highlightMode,
      currentPdfData,
      selectionBounds,
      selectedText,
      currentPageNumber,
      selectedTextBounds,
    ]
  );

  // Handle note creation completion
  const handleNoteCreated = useCallback(
    async (_noteId: string) => {
      // Create highlight annotation linked to the note
      if (pdfViewerRef.current && selectionBounds && selectedText) {
        try {
          // Determine highlight color based on mode
          const getHighlightColor = () => {
            switch (highlightMode) {
              case "quick":
                return "#FFFF00"; // Yellow
              case "comment":
                return "#FFA500"; // Orange
              case "note":
                return "#4A90E2"; // Blue
              default:
                return "#FFFF00";
            }
          };

          const annotationOptions: Partial<HighlightSettings> = {
            bounds: selectedTextBounds as TextBounds[],
            pageNumber: currentPageNumber,
            author: "User",
            subject: `${highlightMode} Highlight`,
            annotationSelectorSettings: {},
            color: getHighlightColor(),
            opacity: 0.4,
            enableMultiPageAnnotation: false,
            enableTextMarkupResizer: true,
            customData: {
              id: `highlight-${_noteId}`,
              noteId: _noteId,
              type: highlightMode,
              text: selectedText,
            },
            isLock: false,
            isPrint: true,
          };
          // Cast to any to bypass TypeScript strictness for minimal working solution

          // Cast to any to bypass TypeScript strictness for minimal working solution
          pdfViewerRef.current?.annotation.addAnnotation(
            "Highlight",
            annotationOptions as HighlightSettings
          );

          // TODO: Create annotation record in database with note linkage
          // This should be done via API call to store the relationship
        } catch (error) {
          console.error("Error creating highlight:", error);
        }
      }

      // DON'T close modal automatically - let user control when to close
      // setShowNoteModal(false);
      // setSelectedText("");
      // setSelectionBounds(null);
    },
    [
      selectionBounds,
      selectedText,
      currentPageNumber,
      selectedTextBounds,
      highlightMode,
    ]
  );

  // Handle modal close without creating note
  const handleCloseNoteModal = useCallback(() => {
    setShowNoteModal(false);
    // Clear selection state when modal is manually closed
    setSelectedText("");
    setSelectionBounds(null);
  }, []);

  // Handle highlight hover
  const handleHighlightHover = useCallback(
    (_annotationId: string, position: { x: number; y: number }) => {
      // TODO: Get note ID from annotation metadata
      // For now, we'll use placeholder data
      setHoveredHighlight({
        noteId: "note-id-placeholder",
        position,
        noteTitle: "Sample Note Title",
      });
      setShowHoverToolbar(true);
    },
    []
  );

  // Handle highlight hover end
  const handleHighlightHoverEnd = useCallback(() => {
    setShowHoverToolbar(false);
    setHoveredHighlight(null);
  }, []);

  // Handle view note in preview
  const handleViewNote = useCallback(() => {
    if (hoveredHighlight?.noteId) {
      setPreviewNoteId(hoveredHighlight.noteId);
      setShowNotePreview(true);
      setShowHoverToolbar(false);
    }
  }, [hoveredHighlight]);

  // Handle close note preview
  const handleCloseNotePreview = useCallback(() => {
    setShowNotePreview(false);
    setPreviewNoteId(null);
  }, []);
  /**
   * Handle PDF document loading
   */
  const handleDocumentLoad = useCallback(async (_args?: any) => {
    setIsLoading(false);
  }, []);

  /**
   * Handle PDF loading errors
   */
  const handleDocumentLoadFailed = useCallback((_args: any) => {
    setIsLoading(false);
    console.error("PDF load failed");
  }, []);

  /**
   * Refresh PDF URL when signed URL expires
   */
  const handleRefreshUrl = useCallback(async () => {
    if (pdfDocument?.id) {
      setAnnotationsLoaded(false); // Reset annotations loaded state for new URL
      await refetchPdf();
    }
  }, [pdfDocument?.id, refetchPdf]);

  // Handle loading states
  if (!pdfDocument) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText size={48} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No PDF Selected
          </h2>
          <p className="text-muted-foreground">
            Please select a PDF document to view
          </p>
        </div>
      </div>
    );
  }

  if (isPdfLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={48}
            className="text-primary mx-auto mb-4 animate-spin"
          />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Loading PDF...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we load your document
          </p>
        </div>
      </div>
    );
  }

  if (pdfError || !currentPdfData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            PDF Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The PDF you're looking for could not be found or you don't have
            permission to view it.
          </p>
          <button
            onClick={handleRefreshUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <PDFViewerFallback
          error="An error occurred while loading the PDF viewer"
          onRetry={handleRefreshUrl}
          onUploadNew={() => router.push("/dashboard")}
          fileName={currentPdfData?.filename}
        />
      }
      onError={(error, errorInfo) => {
        console.error("PDFAnnotationViewer error:", error, errorInfo);
      }}
    >
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        {/* Syncfusion PDF Viewer */}
        <PdfViewerComponent
          ref={pdfViewerRef}
          id="pdf-viewer"
          documentPath={currentPdfData.fileUrl}
          serviceUrl="" // Using client-side rendering
          resourceUrl={resourceUrl}
          style={{ height: "100%", width: "100%" }}
          documentLoad={handleDocumentLoad}
          documentLoadFailed={handleDocumentLoadFailed}
          enableTextSelection={true}
          enableTextSearch={true}
          enableNavigation={true}
          enablePrint={true}
          enableDownload={false} // Disable download to prevent bypassing signed URLs
          enableHyperlink={true}
          enableBookmark={true}
          enableThumbnail={true}
          enableToolbar={true}
          enableNavigationToolbar={true}
          enableTextMarkupAnnotation={true} // Enable highlighting
          zoomMode="FitToWidth"
          enableAnnotation={true}
          textSelectionStart={(args) => {}}
          textSelectionEnd={(args) => handleSelectionTextEnd(args)}
          pageClick={(args) => {
            // Close tooltip when clicking on empty page area (not during text selection)
            if (!selectedText) {
              setSelectionBounds(null);
            }
          }}
          annotationMouseover={(args) => {}}
          annotationMouseLeave={(args) => {}}
          annotationDoubleClick={(args) => {}}
        >
          <Inject
            services={[
              TextSelection,
              TextSearch,
              Navigation,
              LinkAnnotation,
              BookmarkView,
              ThumbnailView,
              Print,
              Annotation,
            ]}
          />
        </PdfViewerComponent>

        {/* Annotations Loaded Indicator */}
        {annotationsLoaded && (
          <div className="absolute bottom-4 right-4 z-40 bg-green-100 text-green-800 px-3 py-2 rounded-lg shadow-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">
                Saved highlights loaded
              </span>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="text-blue-500 mx-auto mb-2 animate-spin"
              />
              <p className="text-gray-600 font-medium">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* Note Creation Modal */}
        <NoteCreationModal
          isOpen={showNoteModal}
          onClose={handleCloseNoteModal}
          selectedText={selectedText}
          pdfTitle={currentPdfData?.filename}
          onNoteCreated={handleNoteCreated}
        />

        {/* Highlight Hover Toolbar */}
        <HighlightHoverToolbar
          isVisible={showHoverToolbar}
          position={hoveredHighlight?.position || null}
          noteId={hoveredHighlight?.noteId || null}
          noteTitle={hoveredHighlight?.noteTitle}
          onViewNote={handleViewNote}
        />

        {/* Note Preview Modal */}
        <NotePreviewModal
          isOpen={showNotePreview}
          onClose={handleCloseNotePreview}
          noteId={previewNoteId}
        />
      </div>
    </ErrorBoundary>
  );
};

export default PDFAnnotationViewer;

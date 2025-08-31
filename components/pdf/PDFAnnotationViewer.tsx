"use client";

/**
 * PDFAnnotationViewer Component
 *
 * Main PDF viewer component that integrates Syncfusion PDF Viewer with annotation functionality.
 * This component handles PDF loading from Supabase signed URLs, text selection, and annotation management.
 *
 * Key Features:
 * - PDF loading from Supabase signed URLs with automatic refresh
 * - Text selection and annotation creation workflow
 * - Annotation overlay rendering and interaction
 * - Mobile-responsive design with touch support
 * - Activity tracking for PDF access
 * - Error handling and fallback UI
 *
 * @author Noto Team
 * @version 1.0.0
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
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
  Annotation as SyncfusionAnnotation,
} from "@syncfusion/ej2-react-pdfviewer";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setActiveSelection,
  setHoveredAnnotation,
  showTooltip,
  hideTooltip,
  showPreviewCard,
  hidePreviewCard,
} from "@/lib/store/annotationSlice";
import { useGetPDFQuery, useGetAnnotationsQuery } from "@/lib/store/apiSlice";
import { PDFDocument, Annotation, Rectangle } from "@/lib/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PDFViewerFallback } from "@/components/pdf/FallbackUI";
import AnnotationTooltip from "@/components/pdf/AnnotationTooltip";
import AnnotationPreviewCard from "@/components/pdf/AnnotationPreviewCard";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";
import { useActivityTracking } from "@/hooks/use-activity-tracking";

/**
 * Props interface for PDFAnnotationViewer component
 */
export interface PDFAnnotationViewerProps {
  /** PDF document to display - can be null for loading state */
  pdfDocument: PDFDocument | null;
  /** Callback when annotation is created */
  onAnnotationCreate?: (
    annotation: Omit<Annotation, "id" | "createdAt" | "updatedAt">
  ) => void;
  /** Callback when annotation is updated */
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void;
  /** Callback when annotation is deleted */
  onAnnotationDelete?: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Interface for text selection event data from Syncfusion
 */
interface TextSelectionEventArgs {
  textContent: string;
  pageIndex: number;
  textBounds: Array<{
    left: number;
    right: number;
    top: number;
    bottom: number;
    width: number;
    height: number;
    pageIndex: number;
  }>;
  name: string;
}

/**
 * Main PDFAnnotationViewer Component
 */
const PDFAnnotationViewer: React.FC<PDFAnnotationViewerProps> = ({
  pdfDocument,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  className = "",
}) => {
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlRefreshCount, setUrlRefreshCount] = useState(0);

  // Component refs
  const pdfViewerRef = useRef<PdfViewerComponent>(null);

  // Hooks
  const router = useRouter();
  const dispatch = useAppDispatch();
  // Responsive design handled via CSS
  const { trackPDFView } = useActivityTracking();

  // Redux state
  const activeSelection = useAppSelector(
    (state) => state.annotations.activeSelection
  );
  const tooltipState = useAppSelector(
    (state) => state.annotations.tooltipState
  );
  const previewCard = useAppSelector((state) => state.annotations.previewCard);
  const hoveredAnnotation = useAppSelector(
    (state) => state.annotations.hoveredAnnotation
  );

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

  // Get annotations for this PDF
  const {
    data: annotations = [],
    error: annotationsError,
    isLoading: isAnnotationsLoading,
    refetch: refetchAnnotations,
  } = useGetAnnotationsQuery(pdfDocument?.id || "", {
    skip: !pdfDocument?.id,
    // Poll for new annotations every 30 seconds for cross-tab sync
    pollingInterval: 30 * 1000,
  });

  // Use fresh PDF data if available, otherwise use prop data
  const currentPdfData = freshPdfData || pdfDocument;

  // Configure resource URL for Syncfusion PDF Viewer (following official solution)
  const resourceUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/lib`
      : "/lib";

  /**
   * Handle PDF document loading
   */
  const handleDocumentLoad = useCallback(async () => {
    setIsLoading(false);
    setError(null);
    console.log("PDF document loaded successfully");

    // Track PDF view activity
    // Note: The main activity tracking happens server-side when the PDF is accessed
    // via the API endpoint, but we also track it client-side for real-time updates
    if (currentPdfData?.id) {
      try {
        await trackPDFView(currentPdfData.id, {
          metadata: {
            filename: currentPdfData.filename,
            fileSize: currentPdfData.fileSize,
            viewedAt: new Date().toISOString(),
          },
          onSuccess: () => {
            console.log("PDF view activity tracked successfully");
          },
          onError: (error) => {
            console.warn("Failed to track PDF view activity:", error.message);
            // Don't throw - activity tracking failure shouldn't break the viewer
          },
        });
      } catch (error) {
        console.warn("Activity tracking error:", error);
        // Don't throw - activity tracking failure shouldn't break the viewer
      }
    }
  }, [currentPdfData]);

  /**
   * Handle PDF loading errors
   */
  const handleDocumentLoadFailed = useCallback((args: any) => {
    setIsLoading(false);
    setError(
      "Failed to load PDF document. The file may be corrupted or the URL has expired."
    );
    console.error("PDF load failed:", args);
  }, []);

  /**
   * Handle text selection events from Syncfusion PDF Viewer
   */
  const handleTextSelection = useCallback(
    (args: TextSelectionEventArgs) => {
      try {
        // Validate input parameters
        if (
          !currentPdfData ||
          !args ||
          !args.textContent ||
          !args.textContent.trim()
        ) {
          console.log("Validation failed - missing data");
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

        // Calculate overall selection bounds
        const left = Math.min(...args.textBounds.map((b) => b.left));
        const right = Math.max(...args.textBounds.map((b) => b.right));
        const top = Math.min(...args.textBounds.map((b) => b.top));
        const bottom = Math.max(...args.textBounds.map((b) => b.bottom));

        const x = left;
        const y = top;
        const width = right - left;
        const height = bottom - top;

        // Validate page index
        if (typeof args.pageIndex !== "number" || args.pageIndex < 0) {
          console.warn("Invalid page index in text selection:", args.pageIndex);
          return;
        }

        const selection = {
          text: args.textContent.trim(),
          pageNumber: args.pageIndex,
          coordinates: {
            x,
            y,
            width,
            height,
          } as Rectangle,
          pdfId: currentPdfData.id,
        };

        dispatch(setActiveSelection(selection));

        // Show annotation tooltip for text selection
        // Convert PDF coordinates to screen coordinates
        let screenX = x + width / 2;
        let screenY = y - 10;

        // Convert PDF coordinates to screen coordinates using Syncfusion's coordinate system
        if (pdfViewerRef.current) {
          try {
            // Use Syncfusion's built-in coordinate conversion if available
            const viewer = pdfViewerRef.current;

            // Get the PDF viewer container element
            const viewerElement = viewer.element;
            if (viewerElement) {
              // Look for the page canvas or page container
              const pageCanvas =
                viewerElement.querySelector(
                  `canvas[id*="${args.pageIndex}"]`
                ) ||
                viewerElement.querySelector(".e-pv-page-canvas") ||
                viewerElement.querySelector(`#pagecanvas_${args.pageIndex}`);

              if (pageCanvas) {
                const canvasRect = pageCanvas.getBoundingClientRect();

                // Convert PDF coordinates to screen coordinates using canvas position
                screenX = canvasRect.left + x + width / 2;
                screenY = canvasRect.top + y - 10;

                console.log("Using canvas coordinate conversion:", {
                  pdfCoords: { x, y, width, height },
                  canvasRect: {
                    left: canvasRect.left,
                    top: canvasRect.top,
                    width: canvasRect.width,
                    height: canvasRect.height,
                  },
                  screenCoords: { x: screenX, y: screenY },
                });
              } else {
                // Fallback to viewer element
                const viewerRect = viewerElement.getBoundingClientRect();
                screenX = viewerRect.left + x + width / 2;
                screenY = viewerRect.top + y - 10;

                console.log("Using viewer element fallback:", {
                  pdfCoords: { x, y, width, height },
                  viewerRect: { left: viewerRect.left, top: viewerRect.top },
                  screenCoords: { x: screenX, y: screenY },
                });
              }
            }
          } catch (error) {
            console.warn(
              "Could not convert PDF coordinates to screen coordinates:",
              error
            );
            // Ultimate fallback to original coordinates
            screenX = x + width / 2;
            screenY = y - 10;
          }
        }

        // Ensure tooltip stays within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust if tooltip would go off screen
        if (screenX > viewportWidth - 200) {
          screenX = viewportWidth - 200;
        }
        if (screenX < 10) {
          screenX = 10;
        }
        if (screenY < 10) {
          screenY = screenY + height + 20; // Position below if too close to top
        }
        if (screenY > viewportHeight - 100) {
          screenY = screenY - 60; // Position above if too close to bottom
        }

        const tooltipPosition = {
          x: screenX,
          y: screenY,
        };

        dispatch(showTooltip(tooltipPosition));
      } catch (error) {
        console.error("Error handling text selection:", error);
        // Don't throw - text selection errors shouldn't break the viewer
      }
    },
    [currentPdfData, dispatch]
  );

  /**
   * Handle annotation creation from tooltip or mobile dialog
   */
  const handleCreateAnnotation = useCallback(() => {
    if (!activeSelection || !currentPdfData) return;

    // Navigate to note creation page with selection data
    const selectionData = encodeURIComponent(
      JSON.stringify({
        text: activeSelection.text,
        pageNumber: activeSelection.pageNumber,
        coordinates: activeSelection.coordinates,
        pdfId: currentPdfData.id,
        pdfFilename: currentPdfData.filename,
      })
    );

    router.push(`/dashboard/notes/new?selection=${selectionData}`);
  }, [activeSelection, currentPdfData, router]);

  /**
   * Handle annotation hover events
   */
  const handleAnnotationHover = useCallback(
    (annotationId: string | null) => {
      dispatch(setHoveredAnnotation(annotationId));

      if (annotationId) {
        const annotation = annotations.find(a => a.id === annotationId);
        if (annotation) {
          dispatch(
            showPreviewCard({
              annotationId,
              position: {
                x: annotation.coordinates.x + annotation.coordinates.width / 2,
                y: annotation.coordinates.y - 10,
              },
            })
          );
        }
      } else {
        dispatch(hidePreviewCard());
      }
    },
    [annotations, dispatch]
  );

  /**
   * Handle annotation click events
   */
  const handleAnnotationClick = useCallback(
    (annotationId: string) => {
      const annotation = annotations.find(a => a.id === annotationId);
      if (annotation) {
        // Navigate to the note for this annotation
        router.push(`/dashboard/notes/${annotation.noteId}`);
      }
    },
    [annotations, router]
  );

  /**
   * Handle annotation edit from preview card
   */
  const handleAnnotationEdit = useCallback(
    (annotationId: string) => {
      const annotation = annotations.find(a => a.id === annotationId);
      if (annotation) {
        // Navigate to edit the note linked to this annotation
        router.push(`/dashboard/notes/${annotation.noteId}`);
      }
    },
    [annotations, router]
  );

  /**
   * Handle annotation delete from preview card
   */
  const handleAnnotationDelete = useCallback(
    (annotationId: string) => {
      if (onAnnotationDelete) {
        onAnnotationDelete(annotationId);
      }
    },
    [onAnnotationDelete]
  );

  /**
   * Refresh PDF URL when signed URL expires
   */
  const handleRefreshUrl = useCallback(async () => {
    if (pdfDocument?.id) {
      setUrlRefreshCount((prev) => prev + 1);
      await refetchPdf();
    }
  }, [pdfDocument?.id, refetchPdf]);

  /**
   * Clear selection when clicking outside
   */
  const handleDocumentClick = useCallback(
    (event: React.MouseEvent) => {
      console.log("Document click triggered");

      // Don't clear selection if there's currently selected text
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        console.log(
          "Ignoring document click - text is selected:",
          selection.toString()
        );
        return;
      }

      // Clear active selection and tooltip when clicking on empty areas
      const target = event.target as HTMLElement;
      if (
        !target.closest(".annotation-tooltip") &&
        !target.closest(".annotation-preview")
      ) {
        console.log("Hiding tooltip due to document click");
        dispatch(setActiveSelection(null));
        dispatch(hideTooltip());
        dispatch(hidePreviewCard());
      }
    },
    [dispatch]
  );

  // Current annotations are already filtered by PDF ID from the API
  const currentAnnotations = annotations;

  // Handle loading states
  if (!pdfDocument) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No PDF selected</p>
          <p className="text-gray-500 text-sm">
            Select a PDF to start viewing and annotating
          </p>
        </div>
      </div>
    );
  }

  if (isPdfLoading && !currentPdfData) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <RefreshCw
            size={32}
            className="text-blue-500 mx-auto mb-4 animate-spin"
          />
          <p className="text-gray-600 font-medium">Loading PDF...</p>
          {/* {pdfDocument?.filename && (
            <p className="text-gray-500 text-sm">{pdfDocument.filename}</p>
          )} */}
        </div>
      </div>
    );
  }

  if (pdfError || error) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-red-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Failed to load PDF</p>
          <p className="text-red-500 text-sm mb-4">
            {error ||
              "The PDF file could not be loaded. The URL may have expired."}
          </p>
          <button
            onClick={handleRefreshUrl}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentPdfData?.fileUrl) {
    return (
      <div
        className={`flex items-center justify-center h-full bg-yellow-50 rounded-lg ${className}`}
      >
        <div className="text-center">
          <AlertCircle size={48} className="text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-600 font-medium mb-2">
            PDF URL not available
          </p>
          <p className="text-yellow-500 text-sm mb-4">
            The PDF file URL is not available. Please try refreshing.
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
      <div
        className={`relative w-full h-full overflow-hidden ${className}`}
        // onClick={handleDocumentClick} // Temporarily disabled for debugging
      >
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
          textSelectionEnd={handleTextSelection}
          textSelectionStart={(args: any) => {
            console.log("Text selection started:", args);
          }}
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
          enableCommentPanel={false} // We handle annotations separately
          enableFormFields={false}
          enableFreeText={false}
          enableTextMarkupAnnotation={false}
          enableShapeAnnotation={false}
          enableMeasureAnnotation={false}
          enableInkAnnotation={false}
          enableStickyNotesAnnotation={false}
          zoomMode="FitToWidth"
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
              SyncfusionAnnotation,
            ]}
          />
        </PdfViewerComponent>

        {/* Annotation Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {currentAnnotations.map((annotation) => (
            <div
              key={annotation.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: annotation.coordinates.x,
                top: annotation.coordinates.y,
                width: annotation.coordinates.width,
                height: annotation.coordinates.height,
                backgroundColor:
                  hoveredAnnotation === annotation.id
                    ? "rgba(59, 130, 246, 0.4)"
                    : "rgba(255, 255, 0, 0.3)",
                border:
                  hoveredAnnotation === annotation.id
                    ? "2px solid rgb(59, 130, 246)"
                    : "1px solid rgba(255, 193, 7, 0.6)",
                borderRadius: "2px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={() => handleAnnotationHover(annotation.id)}
              onMouseLeave={() => handleAnnotationHover(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleAnnotationClick(annotation.id);
              }}
              title={`${annotation.selectedText} - ${annotation.noteContent}`}
            />
          ))}
        </div>

        {/* Annotation Tooltip */}
        <AnnotationTooltip
          visible={tooltipState.visible}
          position={tooltipState.position}
          onCreateNote={handleCreateAnnotation}
          onClose={() => {
            dispatch(setActiveSelection(null));
            dispatch(hideTooltip());
          }}
        />

        {/* Annotation Preview Card */}
        {previewCard.visible && previewCard.annotationId && (
          <AnnotationPreviewCard
            visible={previewCard.visible}
            annotation={annotations.find(a => a.id === previewCard.annotationId)}
            position={previewCard.position}
            onEdit={handleAnnotationEdit}
            onClose={() => dispatch(hidePreviewCard())}
          />
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
      </div>
    </ErrorBoundary>
  );
};

export default PDFAnnotationViewer;

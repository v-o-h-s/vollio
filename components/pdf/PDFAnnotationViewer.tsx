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
import { useGetPDFQuery } from "@/lib/store/apiSlice";
import { PDFDocument, Annotation, Rectangle } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PDFViewerFallback } from "@/components/pdf/FallbackUI";
import AnnotationTooltip from "@/components/pdf/AnnotationTooltip";
import AnnotationPreviewCard from "@/components/pdf/AnnotationPreviewCard";
import MobileAnnotationDialog from "@/components/pdf/MobileAnnotationDialog";
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
  text: string;
  pageNumber: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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
  const isMobile = useIsMobile();
  const { trackPDFView } = useActivityTracking();

  // Redux state
  const annotations = useAppSelector((state) => state.annotations.annotations);
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

  // Use fresh PDF data if available, otherwise use prop data
  const currentPdfData = freshPdfData || pdfDocument;

  // Configure resource URL for Syncfusion PDF Viewer (following official solution)
  const resourceUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/lib`
    : '/lib';

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
      if (!currentPdfData || !args.text.trim()) return;

      const selection = {
        text: args.text.trim(),
        pageNumber: args.pageNumber,
        coordinates: {
          x: args.bounds.x,
          y: args.bounds.y,
          width: args.bounds.width,
          height: args.bounds.height,
        } as Rectangle,
        pdfId: currentPdfData.id,
      };

      dispatch(setActiveSelection(selection));

      if (isMobile) {
        // On mobile, show the annotation dialog
        // This will be handled by the MobileAnnotationDialog component
      } else {
        // On desktop, show the tooltip
        dispatch(
          showTooltip({
            x: args.bounds.x + args.bounds.width / 2,
            y: args.bounds.y - 10,
          })
        );
      }
    },
    [currentPdfData, dispatch, isMobile]
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

      if (annotationId && !isMobile) {
        const annotation = annotations[annotationId];
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
    [annotations, dispatch, isMobile]
  );

  /**
   * Handle annotation click events
   */
  const handleAnnotationClick = useCallback(
    (annotationId: string) => {
      const annotation = annotations[annotationId];
      if (annotation) {
        // Navigate to the note for this annotation
        // We need to find the note that's linked to this annotation
        router.push(`/dashboard/annotations/${annotationId}`);
      }
    },
    [annotations, router]
  );

  /**
   * Handle annotation edit from preview card
   */
  const handleAnnotationEdit = useCallback(
    (annotationId: string) => {
      // Navigate to edit the note linked to this annotation
      router.push(`/dashboard/annotations/${annotationId}`);
    },
    [router]
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
      // Clear active selection and tooltip when clicking on empty areas
      const target = event.target as HTMLElement;
      if (
        !target.closest(".annotation-tooltip") &&
        !target.closest(".annotation-preview")
      ) {
        dispatch(setActiveSelection(null));
        dispatch(hideTooltip());
        dispatch(hidePreviewCard());
      }
    },
    [dispatch]
  );

  // Get current annotations for this PDF
  const currentAnnotations = Object.values(annotations).filter(
    (annotation) => annotation.pdfId === currentPdfData?.id
  );

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
          //typescript is tyring to fuck w me
          {/* 
          {pdfDocument && pdfDocument.filename && (
            <p className="text-gray-500 text-sm">{pdfDocument.filename}</p>
          )}
           */}
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
        onClick={handleDocumentClick}
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
          zoomMode={isMobile ? "FitToPage" : "FitToWidth"}
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

        {/* Desktop Annotation Tooltip */}
        {!isMobile && (
          <AnnotationTooltip
            visible={tooltipState.visible}
            position={tooltipState.position}
            onCreateNote={handleCreateAnnotation}
            onClose={() => {
              dispatch(setActiveSelection(null));
              dispatch(hideTooltip());
            }}
          />
        )}

        {/* Desktop Annotation Preview Card */}
        {!isMobile && previewCard.visible && previewCard.annotationId && (
          <AnnotationPreviewCard
            visible={previewCard.visible}
            annotation={annotations[previewCard.annotationId]}
            position={previewCard.position}
            onEdit={handleAnnotationEdit}
            onClose={() => dispatch(hidePreviewCard())}
          />
        )}

        {/* Mobile Annotation Dialog */}
        {isMobile && activeSelection && (
          <MobileAnnotationDialog
            selectedText={activeSelection.text}
            visible={true}
            onCreateNote={handleCreateAnnotation}
            onClose={() => dispatch(setActiveSelection(null))}
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

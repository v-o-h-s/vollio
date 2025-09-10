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
  Annotation,
} from "@syncfusion/ej2-react-pdfviewer";
import { useGetPDFQuery } from "@/lib/store/apiSlice";
import { PDFDocument } from "@/lib/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PDFViewerFallback } from "@/components/pdf/FallbackUI";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";
import { HighlightSettings } from "@syncfusion/ej2-react-pdfviewer";

/**
 * Props interface for PDFAnnotationViewer component
 */
export interface PDFAnnotationViewerProps {
  /** PDF document to display - can be null for loading state */
  pdfDocument: PDFDocument | null;
  /** Additional CSS classes */
  className?: string;

}

/**
 * Main PDFAnnotationViewer Component
 */
const PDFAnnotationViewer: React.FC<PDFAnnotationViewerProps> = ({
  pdfDocument,
  className = "",

}) => {
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlRefreshCount, setUrlRefreshCount] = useState(0);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [annotationsLoaded, setAnnotationsLoaded] = useState(false);

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









  /* Text Selection Handlers */
  const handleSelectionTextEnd = (args: any) => {
    const highlightBounds: HighlightSettings['bounds'] = args.textBounds.map((b: any) => ({
      x: b.left,
      y: b.top,
      width: b.width,
      height: b.height,
      pageNumber: b.pageIndex + 1
    }));

    pdfViewerRef.current?.annotation.addAnnotation("Highlight", {
      bounds: highlightBounds
    } as HighlightSettings);
  }
  /**
   * Handle PDF document loading
   */
  const handleDocumentLoad = useCallback(async () => {
    setIsLoading(false);
    setError(null);
    console.log("PDF document loaded successfully");


  }, []);

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
   * Refresh PDF URL when signed URL expires
   */
  const handleRefreshUrl = useCallback(async () => {
    if (pdfDocument?.id) {
      setUrlRefreshCount((prev) => prev + 1);
      setAnnotationsLoaded(false); // Reset annotations loaded state for new URL
      await refetchPdf();
    }
  }, [pdfDocument?.id, refetchPdf]);



  // Handle loading states
  if (!pdfDocument) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText
            size={48}
            className="text-muted-foreground mx-auto mb-4"
          />
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
          textSelectionEnd={(args) => handleSelectionTextEnd(args)}
          // Highlight settings
          highlightSettings={{
            author: 'User',
            subject: 'Highlight',
            color: '#FFFF00', // Yellow highlight
            opacity: 0.4,
          }}
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


        {/* Highlight Mode Indicator */}
        {isHighlightMode && (
          <div className="absolute top-16 right-4 z-40 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg shadow-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Select text to highlight</span>
            </div>
          </div>
        )}

        {/* Annotations Loaded Indicator */}
        {annotationsLoaded && (
          <div className="absolute bottom-4 right-4 z-40 bg-green-100 text-green-800 px-3 py-2 rounded-lg shadow-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Saved highlights loaded</span>
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
      </div>
    </ErrorBoundary>
  );
};

export default PDFAnnotationViewer;

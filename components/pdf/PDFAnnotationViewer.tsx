// TODO pls update the any types to proper types from Syncfusion if possible
import React, { useRef, useState, useCallback, useEffect } from "react";
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
  AnnotationSelectEventArgs,
} from "@syncfusion/ej2-react-pdfviewer";
import {
  useGetPDFQuery,
  useCreateHighlightMutation,
  useGetPDFHighlightsQuery,
} from "@/lib/store/apiSlice";
import toast from "react-hot-toast";
import { PDFDocument, TextBounds } from "@/lib/types/pdf";
import { AnnotationMouseoverEventArgs } from "@syncfusion/ej2-react-pdfviewer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PDFViewerFallback } from "@/components/pdf/FallbackUI";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";

import { HighlightSettings } from "@syncfusion/ej2-react-pdfviewer";
import { UnifiedNoteModal } from "./UnifiedNoteModal";
import { HighlightHoverToolbar } from "./HighlightHoverToolbar";


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
  const [isViewerReady, setIsViewerReady] = useState(false);
  // Text selection and toolbar state
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionBounds, setSelectionBounds] = useState<TextBounds | null>(
    null
  );
  const [selectedTextBounds, setSelectedTextBounds] = useState<any[] | null>(
    null
  );
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(0);

  // Highlight hover state
  const [hoveredHighlight, setHoveredHighlight] = useState<{
    noteId: string;
    position: { x: number; y: number };
    noteTitle?: string;
  } | null>(null);

  // Note preview modal state
  const [showNotePreview, setShowNotePreview] = useState(false);
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);
  

  // Quick highlight context menu state
  const [hoveredQuickHighlight, setHoveredQuickHighlight] = useState<{
    id: string;
    position: { x: number; y: number };
    color: string;
    opacity: number;
  } | null>(null);
  const [showHoverTrigger, setShowHoverTrigger] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

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

  // Highlight API hooks
  const [createHighlight] = useCreateHighlightMutation();
  const {
    data: highlightsData,
    error: highlightsError,
    isLoading: highlightsLoading,
  } = useGetPDFHighlightsQuery(
    { pdfId: pdfDocument?.id || "" },
    { skip: !pdfDocument?.id }
  );

  // Configure resource URL for Syncfusion PDF Viewer
  const resourceUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/lib`
      : "/lib";

  // extracting the selection bounds - Syncfusion expects bounds in a specific format
  const extractSelectionBounds = (
    args: TextSelectionCompleteEventArgs
  ): any[] => {
    // Syncfusion expects bounds as an array of objects with x, y, width, height
    return args.textBounds.map((b: any) => ({
      x: b.left || b.x || 0,
      y: b.top || b.y || 0,
      width: b.width || (b.right ? b.right - (b.left || b.x || 0) : 0) || 0,
      height: b.height || (b.bottom ? b.bottom - (b.top || b.y || 0) : 0) || 0,
    }));
  };

  /* Text Selection Handlers */
  const handleSelectionTextEnd = useCallback(
    async (args: TextSelectionCompleteEventArgs) => {
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
      const pageNumber = args.pageIndex;

      // Store selection data
      setSelectedText(selectedTextContent);
      setSelectedTextBounds(textBounds);
      setCurrentPageNumber(pageNumber);

      if (selectedTool === "highlight") {
        switch (highlightMode) {
          case "quick":
            try {
              // Check if PDF viewer is ready before creating annotation
              if (!isViewerReady) {
                console.error("PDF viewer not ready for annotation creation");
                toast.error(
                  "PDF viewer is still loading. Please try again in a moment."
                );
                return;
              }

              // Create Syncfusion annotation first
              const annotationOptions: Partial<HighlightSettings> = {
                bounds: textBounds,
                pageNumber: pageNumber, // Syncfusion uses (page 1 is 1 not 0)
                author: "User",
                subject: "Quick Highlight",
                color: "#FFFF00", // Yellow for quick highlights
                opacity: 0.4,
                customData: {
                  id: `quick-highlight-${Date.now()}`,
                  type: "quick",
                  text: selectedTextContent,
                },
              };

              pdfViewerRef.current!.annotation.addAnnotation(
                "Highlight",
                annotationOptions as HighlightSettings
              );

              // Save to database
              if (currentPdfData?.id) {
                const savedHighlight = await createHighlight({
                  pdfId: currentPdfData.id,
                  content: selectedTextContent,
                  color: "#FFFF00",
                  opacity: 0.4,
                  pageNumber: pageNumber,
                  type: "quick",
                  textbounds: textBounds,
                }).unwrap();

                // Update the annotation with the saved highlight ID
                if (
                  savedHighlight?.highlight?.id &&
                  pdfViewerRef.current?.annotationCollection
                ) {
                  try {
                    const annotations =
                      pdfViewerRef.current.annotationCollection;
                    // Find the most recently created annotation (should be the last one)
                    const lastAnnotation = annotations[annotations.length - 1];
                    if (
                      lastAnnotation &&
                      lastAnnotation.customData?.type === "quick"
                    ) {
                      lastAnnotation.customData.highlightId =
                        savedHighlight.highlight.id;
                    }
                  } catch (error) {
                    console.error(
                      "Error updating annotation with highlight ID:",
                      error
                    );
                  }
                }

                toast.success("Quick highlight created");
              }

              // Clear selection after quick highlight
              setSelectedText("");
              setSelectionBounds(null);
              setSelectedTextBounds(null);
            } catch (error) {
              console.error("Error creating quick highlight:", error);
              toast.error("Failed to create highlight. Please try again.");
            }
            break;

          case "comment":
            try {
              // Check if PDF viewer is ready before creating annotation
              if (!isViewerReady) {
                console.error("PDF viewer not ready for annotation creation");
                toast.error(
                  "PDF viewer is still loading. Please try again in a moment."
                );
                return;
              }

              // Create Syncfusion annotation
              const annotationOptions: Partial<HighlightSettings> = {
                bounds: textBounds,
                pageNumber: pageNumber,
                author: "User",
                subject: "Comment Highlight",
                color: "#FFA500", // Orange for comments
                opacity: 0.4,
                customData: {
                  id: `comment-highlight-${Date.now()}`,
                  type: "comment",
                  text: selectedTextContent,
                },
              };

              pdfViewerRef.current!.annotation.addAnnotation(
                "Highlight",
                annotationOptions as HighlightSettings
              );

              // Save to database
              if (currentPdfData?.id) {
                await createHighlight({
                  pdfId: currentPdfData.id,
                  content: selectedTextContent,
                  color: "#FFA500",
                  opacity: 0.4,
                  pageNumber: pageNumber,
                  type: "comment",
                  textbounds: textBounds,
                }).unwrap();
                toast.success("Comment highlight created");
              }

              // Clear selection after comment highlight
              setSelectedText("");
              setSelectionBounds(null);
              setSelectedTextBounds(null);
            } catch (error) {
              console.error("Error creating comment highlight:", error);
              toast.error(
                "Failed to create comment highlight. Please try again."
              );
            }
            break;

          case "note":
            // Reset highlight creation flag for new note
            setHighlightCreated(false);
            setShowNoteModal(true);
            break;

          default:
            console.warn("Unknown highlight mode:", highlightMode);
        }
      }
    },
    [
      selectedTool,
      highlightMode,
      currentPdfData,
      selectionBounds,
      selectedText,
      currentPageNumber,
      selectedTextBounds,
      isViewerReady,
    ]
  );

  // Track if highlight has been created for the current note
  const [highlightCreated, setHighlightCreated] = useState(false);

  // Handle note creation completion
  const handleNoteCreated = useCallback(
    async (noteId: string) => {
      // Only create highlight annotation once when note is first created
      if (
        !highlightCreated &&
        pdfViewerRef.current &&
        selectedTextBounds &&
        selectedText &&
        currentPdfData?.id
      ) {
        try {
          // Check if PDF viewer is ready before creating annotation
          if (!isViewerReady) {
            console.error("PDF viewer not ready for annotation creation");
            toast.error(
              "PDF viewer is still loading. Please try again in a moment."
            );
            return;
          }

          // Create Syncfusion annotation
          const annotationOptions: Partial<HighlightSettings> = {
            bounds: selectedTextBounds,
            pageNumber: currentPageNumber, // Syncfusion uses 1-based page numbers
            author: "User",
            subject: "Note Highlight",
            color: "#4A90E2", // Blue for note highlights
            opacity: 0.4,
            customData: {
              id: `note-highlight-${noteId}`,
              noteId: noteId,
              type: "note",
              text: selectedText,
            },
          };

          pdfViewerRef.current.annotation.addAnnotation(
            "Highlight",
            annotationOptions as HighlightSettings
          );

          // Save highlight to database with note linkage
          await createHighlight({
            pdfId: currentPdfData.id,
            content: selectedText,
            color: "#4A90E2",
            opacity: 0.4,
            pageNumber: currentPageNumber,
            type: "note",
            textbounds: selectedTextBounds,
            noteId: noteId, // Link to the created note
          }).unwrap();
          toast.success("Note and highlight created successfully");

          // Mark highlight as created to prevent duplicate creation
          setHighlightCreated(true);
        } catch (error) {
          console.error("Error creating note highlight:", error);
          toast.error("Failed to create note highlight. Please try again.");
        }
      }
    },
    [
      highlightCreated,
      selectedText,
      currentPageNumber,
      selectedTextBounds,
      currentPdfData?.id,
      createHighlight,
      isViewerReady,
    ]
  );

  // Handle modal close without creating note
  const handleCloseNoteModal = useCallback(() => {
    setShowNoteModal(false);
    // Clear selection state when modal is manually closed
    setSelectedText("");
    setSelectionBounds(null);
    setSelectedTextBounds(null);
    // Reset highlight creation flag
    setHighlightCreated(false);
  }, []);

  // Handle annotation mouseover
  const handleAnnotationMouseover = useCallback(
    (args: AnnotationMouseoverEventArgs) => {
      try {
        // Get annotation data from Syncfusion event
        const annotation = args.annotation;
        if (!annotation || !annotation.customData) return;

        const customData = annotation.customData;
        console.log(customData);
        const annotationType = customData.type;

        // Convert PDF coordinates to screen coordinates
        const bounds = annotation.bounds[0]; // Get first bound
        if (!bounds) return;

        // Get the PDF viewer element for coordinate conversion
        const viewerElement = pdfViewerRef.current?.element;
        if (!viewerElement) return;

        // Find the page canvas for coordinate conversion
        const pageCanvas =
          viewerElement.querySelector(
            `canvas[id*="${annotation.pageNumber}"]`
          ) || viewerElement.querySelector(".e-pv-page-canvas");

        let screenX = bounds.x + bounds.width / 2;
        let screenY = bounds.y + bounds.height / 2;

        if (pageCanvas) {
          const canvasRect = pageCanvas.getBoundingClientRect();
          screenX = canvasRect.left + bounds.x + bounds.width / 2;
          screenY = canvasRect.top + bounds.y + bounds.height / 2;
        }

        // Handle different annotation types
        if (annotationType === "quick") {
          // Show context menu trigger for quick highlights
          setHoveredQuickHighlight({
            id: customData.highlightId || customData.id,
            position: { x: screenX, y: screenY },
            color: annotation.color || "#FFFF00",
            opacity: annotation.opacity || 0.4,
          });
          setShowHoverTrigger(true);
        } else if (annotationType === "note" || annotationType === "comment") {
          // Show existing hover toolbar for note/comment highlights
          setHoveredHighlight({
            noteId: customData.noteId || "placeholder",
            position: { x: screenX, y: screenY },
            noteTitle: customData.noteTitle || "Note",
          });
        }
      } catch (error) {
        console.error("Error handling annotation mouseover:", error);
      }
    },
    []
  );

  // Handle annotation mouse leave
  const handleAnnotationMouseLeave = useCallback(() => {
    // Use a small delay to prevent flickering when moving between annotation and trigger
    setTimeout(() => {
      setShowHoverTrigger(false);
      setHoveredQuickHighlight(null);
      setHoveredHighlight(null);
    }, 100);
  }, []);

  // handle annotation click
  const handleAnnotationClick = useCallback(
    (args: AnnotationSelectEventArgs) => {
      try {
        const annotation = args.annotation;

        if (!annotation) {
          console.log("No annotation found in args");
          return;
        }

        if (!annotation.customData) {
          console.log("No customData found in annotation:", annotation);
          return;
        }

        const customData = annotation.customData;
        console.log("📋 Annotation customData:", customData);

        // Check if this is a linked note highlight
        if (customData.type === "note" && customData.noteId) {
          console.log(
            "✅ Found note annotation with noteId:",
            customData.noteId
          );

          // Open note preview modal
          console.log("🔄 Setting preview state:", {
            noteId: customData.noteId,
            showNotePreview: true
          });
          
          setPreviewNoteId(customData.noteId);
          setShowNotePreview(true);
          
          console.log("📊 Modal state after setting:", {
            previewNoteId: customData.noteId,
            showNotePreview: true
          });
          
          toast.success("Opening note preview");
        } else {
          console.log("❌ Annotation conditions not met:", {
            type: customData.type,
            noteId: customData.noteId,
            hasNoteId: !!customData.noteId,
            isNoteType: customData.type === "note",
          });
        }
      } catch (error) {
        console.error("Error handling annotation click:", error);
      }
    },
    []
  );

 


  // Handle context menu trigger click
  const handleContextMenuTriggerClick = useCallback(() => {
    setShowHoverTrigger(false);
    setShowContextMenu(true);
  }, []);

  // Handle context menu close
  const handleContextMenuClose = useCallback(() => {
    setShowContextMenu(false);
    setHoveredQuickHighlight(null);
  }, []);

  // Handle highlight updated
  const handleHighlightUpdated = useCallback(
    (highlightId: string, updates: { color?: string; opacity?: number }) => {
      // Update the Syncfusion annotation if it exists
      if (pdfViewerRef.current?.annotationCollection) {
        try {
          const annotations = pdfViewerRef.current.annotationCollection;
          const targetAnnotation = annotations.find(
            (ann: any) =>
              ann.customData?.highlightId === highlightId ||
              ann.customData?.id === highlightId
          );

          if (targetAnnotation) {
            // Update annotation properties
            if (updates.color) {
              targetAnnotation.color = updates.color;
            }
            if (updates.opacity !== undefined) {
              targetAnnotation.opacity = updates.opacity;
            }

            // Trigger a re-render of the annotation
            try {
              pdfViewerRef.current.annotation.editAnnotation(targetAnnotation);
            } catch (editError) {
              // Edit annotation method failed, properties updated in memory
            }
          }
        } catch (error) {
          console.error("Error updating Syncfusion annotation:", error);
        }
      }
    },
    []
  );
  /**
   * Load existing highlights from database
   */
  const loadExistingHighlights = useCallback(async () => {
    // Don't load if already loaded
    if (annotationsLoaded) {
      return;
    }

    // Check if we have highlights to load
    if (!highlightsData?.highlights || highlightsData.highlights.length === 0) {
      setAnnotationsLoaded(true);
      return;
    }

    // Check if PDF viewer and annotation module are ready
    if (!pdfViewerRef.current?.annotation) {
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const highlight of highlightsData.highlights) {
        try {
          // Ensure page number is 1-based for Syncfusion (convert from 0-based if needed)
          const syncfusionPageNumber =
            highlight.pageNumber >= 1
              ? highlight.pageNumber
              : highlight.pageNumber + 1;

          const annotationOptions: Partial<HighlightSettings> = {
            bounds: highlight.textbounds,
            pageNumber: syncfusionPageNumber,
            author: "User",
            subject: `${highlight.type} Highlight`,
            color: highlight.color,
            opacity: highlight.opacity,
            customData: {
              id: `existing-highlight-${highlight.id}`,
              highlightId: highlight.id,
              noteId: highlight.noteId,
              type: highlight.type,
              text: highlight.content,
            },
          };

          pdfViewerRef.current.annotation.addAnnotation(
            "Highlight",
            annotationOptions as HighlightSettings
          );

          successCount++;
        } catch (highlightError) {
          errorCount++;
          console.error(
            `❌ Error loading highlight ${highlight.id}:`,
            highlightError
          );
          // Continue loading other highlights even if one fails
        }
      }

      setAnnotationsLoaded(true);

      if (successCount > 0) {
        toast.success(`Loaded ${successCount} existing highlights`);
      }
    } catch (error) {
      console.error("Error loading existing highlights:", error);
      setAnnotationsLoaded(true); // Mark as loaded to prevent infinite retries
    }
  }, [highlightsData, annotationsLoaded]);

  // Handle highlight deleted
  const handleHighlightDeleted = useCallback(
    (highlightId: string) => {
      // Remove the annotation from Syncfusion viewer
      if (pdfViewerRef.current?.annotationCollection) {
        try {
          const annotations = pdfViewerRef.current.annotationCollection;
          const targetAnnotation = annotations.find(
            (ann: any) =>
              ann.customData?.highlightId === highlightId ||
              ann.customData?.id === highlightId
          );

          if (targetAnnotation) {
            //pdfViewerRef.current.annotation.deleteAnnotation(targetAnnotation);
          }
        } catch (error) {
          console.error("Error deleting Syncfusion annotation:", error);
          // Fallback: reload highlights from database
          setAnnotationsLoaded(false);
          setTimeout(() => {
            loadExistingHighlights();
          }, 100);
        }
      }
    },
    [loadExistingHighlights]
  );

  // Handle hover trigger end
  const handleHoverTriggerEnd = useCallback(() => {
    setShowHoverTrigger(false);
    setHoveredQuickHighlight(null);
  }, []);

  // Handle note preview modal close
  const handleCloseNotePreview = useCallback(() => {
    setShowNotePreview(false);
    setPreviewNoteId(null);
  }, []);

  // Effect to load highlights when viewer is ready and we have data
  useEffect(() => {
    if (
      isViewerReady &&
      highlightsData &&
      !annotationsLoaded &&
      pdfViewerRef.current?.annotation
    ) {
      loadExistingHighlights();
    }
  }, [
    isViewerReady,
    highlightsData,
    annotationsLoaded,
    loadExistingHighlights,
  ]);

  // Effect to handle initial loading state
  useEffect(() => {
    if (currentPdfData?.fileUrl && !isPdfLoading) {
      // Keep isLoading true until documentLoad event fires
    } else if (!currentPdfData && !isPdfLoading && !pdfError) {
      // If no PDF data and not loading, something went wrong
      setIsLoading(false);
    }
  }, [currentPdfData?.fileUrl, isPdfLoading, pdfError]);

  // Effect to reset loading state when fresh PDF data is available
  useEffect(() => {
    if (currentPdfData?.fileUrl && isLoading && !isPdfLoading) {
      // Fallback timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        if (isLoading) {
          console.warn(
            "Document load timeout reached, forcing loading state to false"
          );
          setIsLoading(false);
          setIsViewerReady(true);
        }
      }, 15000); // 15 second timeout

      return () => clearTimeout(loadingTimeout);
    }
  }, [currentPdfData?.fileUrl, isLoading, isPdfLoading]);

  /**
   * Handle PDF loading errors
   */
  const handleDocumentLoadFailed = useCallback(() => {
    setIsLoading(false);
    console.error("PDF load failed");
    toast.error("Failed to load PDF document");
  }, []);

  /**
   * Refresh PDF URL when signed URL expires
   */
  const handleRefreshUrl = useCallback(async () => {
    if (pdfDocument?.id) {
      setAnnotationsLoaded(false); // Reset annotations loaded state for new URL
      setIsLoading(true); // Show loading state during refresh
      setIsViewerReady(false); // Reset viewer ready state
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
          documentLoad={() => {
            setIsLoading(false);
            setIsViewerReady(true);
          }}
          documentLoadFailed={handleDocumentLoadFailed}
          created={() => {
            // PDF viewer created
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
          enableTextMarkupAnnotation={true} // Enable highlighting
          zoomMode="FitToWidth"
          enableAnnotation={true}
          textSelectionStart={() => {}}
          textSelectionEnd={(args) => handleSelectionTextEnd(args)}
          pageClick={() => {
            // Close tooltip when clicking on empty page area (not during text selection)
            if (!selectedText) {
              setSelectionBounds(null);
            }
          }}
          annotationMouseover={(args) => handleAnnotationMouseover(args)}
          annotationMouseLeave={() => handleAnnotationMouseLeave()}
          annotationSelect={(args) => handleAnnotationClick(args)}
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

        {/* Loading Overlay */}
        {(isLoading || isPdfLoading) && (
          <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="text-primary mx-auto mb-2 animate-spin"
              />
              <p className="text-foreground font-medium">Loading PDF...</p>
            </div>
          </div>
        )}


        {/* Note Preview Modal */}
        <UnifiedNoteModal
          isOpen={showNotePreview}
          onClose={handleCloseNotePreview}
          noteId={previewNoteId}
          mode="preview"
        />

      </div>
    </ErrorBoundary>
  );
};

export default PDFAnnotationViewer;

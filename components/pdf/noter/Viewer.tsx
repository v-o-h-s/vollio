import { PDFDocument } from "@/lib/types/pdf";
import { ViewerHeader } from "./ViewerHeader";
import { TextSelectionPopup } from "./TextSelectionPopup";
import { useRef, useState } from "react";
import {
  Annotation,
  BookmarkView,
  Inject,
  Magnification,
  LinkAnnotation,
  Navigation,
  PdfViewerComponent,
  Print,
  TextSearch,
  TextSelection,
  ThumbnailView,
  HighlightSettings,
} from "@syncfusion/ej2-react-pdfviewer";
import { ChevronUp } from "lucide-react";

interface ViewerProps {
  pdfDocument: PDFDocument;
  onToggleNoter?: () => void;
}

export interface textBound {
  bottom: number;
  height: number;
  left: number;
  pageIndex: number;
  right: number;
  top: number;
  width: number;
}

export default function Viewer({ pdfDocument, onToggleNoter }: ViewerProps) {
  const resourceUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/lib`
      : "/lib";

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#FFEB3B");
  const pdfViewerRef = useRef<PdfViewerComponent>(null);

  // State for text selection popup
  const [selectionBounds, setSelectionBounds] = useState<{
    x: number;
    y: number;
    textBounds: textBound[];
    pageIndex: number;
  } | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Handle highlight with selected color
  const handleHighlight = async () => {
    if (!pdfViewerRef.current || !selectionBounds) return;

    try {
      const viewer = pdfViewerRef.current;

      // Process bounds to the format expected by Syncfusion
      const processedBounds = selectionBounds.textBounds.map((bound) => ({
        x: bound.left,
        y: bound.top,
        width: bound.width,
        height: bound.height,
      }));

      // Use the exact pattern from Syncfusion documentation
      viewer.annotation.addAnnotation("Highlight", {
        isLock: true,
        bounds: processedBounds,
        pageNumber: selectionBounds.pageIndex, // Convert to 1-based page numbers
        color: currentHighlightColor,
        opacity: 0.5,
      });

      // Close popup after highlighting
      setShowPopup(false);
      setSelectionBounds(null);
    } catch (error) {
      console.error("Failed to create highlight:", error);
      setShowPopup(false);
      setSelectionBounds(null);
    }
  };

  // Handle text selection end
  const handleTextSelectionEnd = (args: any) => {
    if (args.textBounds && args.textBounds.length > 0) {
      // Get the first text bound to calculate popup position
      const firstBound = args.textBounds[0];

      // Calculate popup position (above the selection)
      const x = firstBound.left;
      const y = firstBound.top - 10;

      setSelectionBounds({
        x,
        y,
        textBounds: args.textBounds,
        pageIndex: firstBound.pageIndex,
      });
      setShowPopup(true);
    }
  };

  // Close popup when clicking outside
  const handlePageClick = () => {
    setShowPopup(false);
    setSelectionBounds(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {isHeaderVisible ? (
        <ViewerHeader
          currentHighlightColor={currentHighlightColor}
          onHighlightColorChange={setCurrentHighlightColor}
          onToggleNoter={onToggleNoter}
          pdfDocument={pdfDocument}
          isHeaderVisible={isHeaderVisible}
          setIsHeaderVisible={setIsHeaderVisible}
          pdfViewerRef={pdfViewerRef}
        />
      ) : (
        <button
          onClick={() => setIsHeaderVisible(true)}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] 
            bg-white dark:bg-gray-900 
            text-gray-900 dark:text-gray-100 
            px-4 py-2 rounded-xl
            border border-gray-200 dark:border-gray-700
            shadow-sm dark:shadow-gray-900/50
            hover:bg-gray-50 dark:hover:bg-gray-800 
            active:scale-95 
            font-medium text-sm flex items-center gap-2
            animate-in fade-in slide-in-from-top-2 duration-300
            backdrop-blur-sm cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
          <span>Show Header</span>
        </button>
      )}
      <div className="flex-1 w-full overflow-hidden relative">
        {/* Text Selection Popup */}
        {showPopup && selectionBounds && (
          <TextSelectionPopup
            onHighlight={handleHighlight}
            x={selectionBounds.x}
            y={selectionBounds.y}
            textBounds={selectionBounds.textBounds}
            pageIndex={selectionBounds.pageIndex}
            onClose={() => setShowPopup(false)}
          />
        )}

        <PdfViewerComponent
          ref={pdfViewerRef}
          id="viewer"
          documentPath={pdfDocument.fileUrl}
          resourceUrl={resourceUrl}
          style={{ height: "100%", width: "100%" }}
          enableTextSelection={true}
          enableTextSearch={true}
          enableNavigation={true}
          enablePrint={true}
          enableDownload={false}
          enableHyperlink={true}
          enableBookmark={true}
          enableThumbnail={true}
          enableToolbar={true}
          enableNavigationToolbar={true}
          enableTextMarkupAnnotation={true}
          zoomMode="FitToWidth"
          enableAnnotation={true}
          textSelectionStart={() => {}}
          textSelectionEnd={handleTextSelectionEnd}
          pageClick={handlePageClick}
          annotationDoubleClick={() => {}}
          {...({
            annotationMouseover: (args: any) => {
              console.log("Annotation Mouse Over:", args);
            },
            annotationMouseLeave: (args: any) => {
              console.log("Annotation Mouse Leave:", args);
            },
          } as any)}
        >
          <Inject
            services={[
              Magnification,
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
      </div>
    </div>
  );
}

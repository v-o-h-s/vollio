// will be deleted soon
import { PDFDocument } from "@/lib/types/pdf";
import { ViewerHeader } from "./ViewerHeader";
import { TextSelectionPopup } from "./TextSelectionPopup";
import { useEffect, useRef, useState } from "react";
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
    // for now we will just handle selection in one page lol
    pageIndex: number;
  } | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => { console.log(currentHighlightColor) }, [currentHighlightColor])

  // Handle highlight with selected color
  const handleHighlight = async (color: string) => {
    if (!pdfViewerRef.current || !selectionBounds) return;

    try {
      const viewer = pdfViewerRef.current;

      // Set highlight color in annotation settings
      viewer.highlightSettings.color = color;
      viewer.highlightSettings.opacity = 0.5;

      // Add highlight annotation
      viewer.annotation.addAnnotation("Highlight");

      // TODO: Save highlight to backend
      console.log("Highlight created:", {
        pdfId: pdfDocument.id,
        color,
        bounds: selectionBounds.textBounds,
        pageIndex: selectionBounds.pageIndex,
      });

      // Close popup after highlighting
      setShowPopup(false);
      setSelectionBounds(null);
    } catch (error) {
      console.error("Failed to create highlight:", error);
    }
  };

  // Handle text selection end
  const handleTextSelectionEnd = (args: any) => {
    console.log("Text selection args:", args);

    if (args.textBounds && args.textBounds.length > 0) {
      // Get the first text bound to calculate popup position
      const firstBound = args.textBounds[0];

      // Calculate popup position (above the selection)
      // Using the viewer's coordinate system
      const x = firstBound.left;
      const y = firstBound.top - 10; // Position above the selection

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
          enableDownload={false} // Disable download to prevent bypassing signed URLs
          enableHyperlink={true}
          enableBookmark={true}
          enableThumbnail={true}
          enableToolbar={true}
          enableNavigationToolbar={true}
          enableTextMarkupAnnotation={true} // Enable highlighting
          zoomMode="FitToWidth"
          enableAnnotation={true}
          textSelectionStart={() => { }}
          textSelectionEnd={handleTextSelectionEnd}
          pageClick={handlePageClick}
          // annotationMouseover={(args) => handleAnnotationMouseover(args)}
          // annotationMouseLeave={() => handleAnnotationMouseLeave()}
          annotationDoubleClick={() => { }}
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

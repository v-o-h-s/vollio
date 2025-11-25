import { PDFDocument } from "@/lib/types/pdf";
import { ViewerHeader } from "./ViewerHeader";
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
} from "@syncfusion/ej2-react-pdfviewer";
import { ChevronUp } from "lucide-react";

interface ViewerProps {
  pdfDocument: PDFDocument;
  onToggleNoter?: () => void;
}

export default function Viewer({ pdfDocument, onToggleNoter }: ViewerProps) {
  const resourceUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/lib`
      : "/lib";

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const pdfViewerRef = useRef<PdfViewerComponent>(null);
  return (
    <div className="relative w-full h-full flex flex-col">
      {isHeaderVisible ? (
        <ViewerHeader
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
      <div className="flex-1 w-full overflow-hidden">
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
          textSelectionStart={() => {}}
          // textSelectionEnd={(args) => handleSelectionTextEnd(args)}
          // pageClick={() => {
          //   // Close tooltip when clicking on empty page area (not during text selection)
          //   if (!selectedText) {
          //     setSelectionBounds(null);
          //   }
          // }}
          // annotationMouseover={(args) => handleAnnotationMouseover(args)}
          // annotationMouseLeave={() => handleAnnotationMouseLeave()}
          annotationDoubleClick={() => {}}
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

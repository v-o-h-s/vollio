"use client";

// SSR safeguard for pdf.js evaluation
if (typeof window === "undefined") {
  (global as any).window = {};
  (global as any).document = {
    documentElement: {
      style: {},
    },
  };
  (global as any).navigator = {
    userAgent: "",
  };
}
import "@/app/styles/components/betterViewer.css";
import { ChevronUp } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  PdfHighlighter,
  PdfHighlighterUtils,
  PdfLoader,
  PdfScaleValue,
} from "react-pdf-highlighter-extended-plus";
import { useRef } from "react";
import { ExplanationBox } from "./Assistant/ExplanationBox";
import { ExpandableTip } from "./highlight/ExpandableTip";
import { TagSelectionDialog } from "./tags/TagSelectionDialog";
import { HighlightContainer } from "./highlight/HighlightContainer";
import { TagSidebar } from "./tags/TagSidebar";
import { PDFLoading } from "@/components/ui/PDFLoading";
import { useGetPDFHighlightsQuery } from "@/lib/store/apiSlice";
import { useSelection } from "@/features/file-view/hooks/useTextSelection";
import { useHighlightActions } from "@/features/file-view/hooks/useHighlightActions";
import { MyHighlight } from "@/lib/types/highlight";
import { ViewerHeader } from "./viewheader";
import { useSummaryActions } from "@/features/file-view/hooks/useSummaryActions";
import { SummarySidebar } from "./summary/SummarySidebar";
import { FileDetails } from "../types/document";
export const BetterViewer = ({
  file,
  onToggleNoter,
}: {
  file: FileDetails;
  onToggleNoter?: () => void;
}) => {
  // Fetch highlights for this PDF from API
  const { data: apiHighlights, isLoading: isLoadingHighlights } =
    useGetPDFHighlightsQuery(file.id);

  const { handleUpdateAllHighlight, handleDeleteAllHighlight } =
    useHighlightActions();

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isTagSidebarOpen, setIsTagSidebarOpen] = useState(false);
  const [isSummarySidebarOpen, setIsSummarySidebarOpen] = useState(false);
  const [isExplanationBoxOpen, setIsExplanationBoxOpen] = useState(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#FFEB3B");
  const [zoomValue, setZoomValue] = useState<PdfScaleValue>("page-width");

  /** Refs for PdfHighlighter utilities */
  const highlighterUtilsRef = useRef<PdfHighlighterUtils | null>(null);

  // Summary actions hook
  const { summary, addMainPoint, removeMainPoint } = useSummaryActions(file.id);

  const {
    isTagDialogOpen,
    setIsTagDialogOpen,
    isExplainOpen,
    setIsExplainOpen,
    explainResult,
    handleTagConfirm,
    handleCreateHighlight,
    handleAddToSummary,
    handleAddNote,
    handleCopy,
    handleExplain,
    handleAddTag,
  } = useSelection({
    highlighterUtilsRef,
    file,
    currentHighlightColor,
  });

  // Map API highlights to react-pdf-highlighter format
  const highlights = useMemo<Array<MyHighlight>>(() => {
    if (!apiHighlights) return [];
    return apiHighlights.map((h) => ({
      id: h.id,
      position: h.position,
      content: h.content,
      type: h.type,
      color: h.color || undefined,
      tags: h.tags || undefined,
      style: h.style || undefined,
      noteId: h.noteId ?? undefined,
    })) as MyHighlight[];
  }, [apiHighlights]);

  // Adapter to make ViewerHeader work with react-pdf-highlighter-extended
  const pdfViewerAdapter = useRef<any>({
    // Getters will be added in useEffect to access current refs
    navigation: {},
    magnification: {},
  });

  // Initialize adapter methods
  useEffect(() => {
    const adapter = pdfViewerAdapter.current;

    // Define getters for properties polled by ViewerHeader
    Object.defineProperties(adapter, {
      currentPageNumber: {
        get: () =>
          highlighterUtilsRef.current?.getViewer()?.currentPageNumber || 1,
        configurable: true,
      },
      pageCount: {
        get: () => highlighterUtilsRef.current?.getViewer()?.pagesCount || 1,
        configurable: true,
      },
      zoomPercentage: {
        get: () =>
          Math.round(
            (highlighterUtilsRef.current?.getViewer()?.currentScale || 1) * 100
          ),
        configurable: true,
      },
    });

    // Implement navigation
    adapter.navigation = {
      goToPage: (page: number) => {
        const viewer = highlighterUtilsRef.current?.getViewer();
        if (viewer) {
          viewer.currentPageNumber = page;
        }
      },
    };
    // Fallback for direct call
    adapter.goToPage = adapter.navigation.goToPage;

    // Implement magnification
    adapter.magnification = {
      zoomIn: () => {
        setZoomValue((prev: PdfScaleValue) => {
          // If it's a string (auto/page-width), start from current scale
          const currentScale =
            highlighterUtilsRef.current?.getViewer()?.currentScale || 1;
          return currentScale + 0.1; // +10%
        });
      },
      zoomOut: () => {
        setZoomValue((prev: PdfScaleValue) => {
          const currentScale =
            highlighterUtilsRef.current?.getViewer()?.currentScale || 1;
          return Math.max(0.1, currentScale - 0.1); // -10%
        });
      },
      fitToPage: () => {
        setZoomValue("page-fit");
      },
      zoomTo: (value: number) => {
        setZoomValue(value / 100);
      },
    };
  }, []);

  const handleScrollToHighlight = (highlight: MyHighlight) => {
    if (highlighterUtilsRef.current) {
      highlighterUtilsRef.current.scrollToHighlight(highlight);
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden ">
      {isHeaderVisible ? (
        <ViewerHeader
          file={file}
          isHeaderVisible={isHeaderVisible}
          setIsHeaderVisible={setIsHeaderVisible}
          pdfViewerRef={pdfViewerAdapter}
          currentHighlightColor={currentHighlightColor}
          onHighlightColorChange={setCurrentHighlightColor}
          onToggleNoter={onToggleNoter}
          onToggleTags={() => setIsTagSidebarOpen(!isTagSidebarOpen)}
          isTagsOpen={isTagSidebarOpen}
          onToggleSummary={() => setIsSummarySidebarOpen(!isSummarySidebarOpen)}
          isSummaryOpen={isSummarySidebarOpen}
        />
      ) : (
        <button
          onClick={() => setIsHeaderVisible(true)}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-999 
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

      <div className="flex-1 relative overflow-hidden [&_*::-webkit-scrollbar]:w-2 [&_*::-webkit-scrollbar]:h-2 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&_*::-webkit-scrollbar-thumb]:rounded-full hover:[&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/40 transition-colors">
        <PdfLoader
          onError={(error) => console.log(error)} // todo Better visualization
          document={file.fileUrl as string}
          // workerSrc="/pdf.worker.min.mjs"
          // //workerSrc="//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs"
          beforeLoad={(progress) => <PDFLoading progress={progress} />}
        >
          {(pdfDocument) => (
            <PdfHighlighter
              pdfScaleValue={zoomValue}
              enableAreaSelection={(event) => event.altKey}
              pdfDocument={pdfDocument}
              utilsRef={(_pdfHighlighterUtils) => {
                highlighterUtilsRef.current = _pdfHighlighterUtils;
              }}
              selectionTip={
                <ExpandableTip
                  onHighlight={handleCreateHighlight}
                  onCopy={handleCopy}
                  onAddTag={handleAddTag}
                  onAddNote={handleAddNote}
                  onAddToSummary={handleAddToSummary}
                  onExplain={handleExplain}
                />
              }
              highlights={highlights}
            >
              <HighlightContainer
                updateHighlight={handleUpdateAllHighlight}
                deleteHighlight={handleDeleteAllHighlight}
              />
            </PdfHighlighter>
          )}
        </PdfLoader>
      </div>

      {/* Tag Selection Dialog */}
      <TagSelectionDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        onConfirm={handleTagConfirm}
      />

      {/* Tag Sidebar Overlay */}
      <TagSidebar
        isOpen={isTagSidebarOpen}
        onClose={() => setIsTagSidebarOpen(false)}
        highlights={highlights}
        onScrollToHighlight={handleScrollToHighlight}
      />

      {/* Summary Sidebar */}
      <SummarySidebar
        isOpen={isSummarySidebarOpen}
        onClose={() => setIsSummarySidebarOpen(false)}
        summary={summary ?? null}
        onRemoveMainPoint={removeMainPoint}
      />

      {/* Explanation Box */}
      <ExplanationBox
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        explainResult={explainResult}
        onSaveToNotes={() => {}}
      />
    </div>
  );
};

"use client";

import "@/app/styles/components/viewer.css";
import { ChevronUp } from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import {
  PdfHighlighter,
  PdfHighlighterUtils,
  PdfLoader,
  PdfScaleValue,
} from "react-pdf-highlighter-extended";
import { Highlight } from "react-pdf-highlighter-extended";
import { useRef } from "react";
import { PDFDocument } from "@/lib/types/pdf";
import { ExpandableTip } from "./highlight/ExpandableTip";
import { TagSelectionDialog } from "./highlight/TagSelectionDialog";
import { HighlightContainer } from "./highlight/HighlightContainer";
import { ViewerHeader } from "./ViewerHeader";
import { PDFLoading } from "@/components/ui/PDFLoading";
import {
  useGetPDFHighlightsQuery,
  useCreateHighlightMutation,
  useUpdateHighlightMutation,
  useDeleteHighlightMutation,
} from "@/lib/store/apiSlice";
import type { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

// Extend Highlight type to include color
export interface MyHighlight extends Highlight {
  tags?: string[];
  style?: "highlight" | "underline" | "tagged";
  noteId?: string;
  color?: string;
}

export const BetterViewer = ({
  pdfDocument,
  onToggleNoter,
}: {
  pdfDocument: PDFDocument;
  onToggleNoter?: () => void;
}) => {
  // Fetch highlights for this PDF from API
  const { data: apiHighlights, isLoading: isLoadingHighlights } =
    useGetPDFHighlightsQuery(pdfDocument.id);
  const [createHighlight] = useCreateHighlightMutation();
  const [deleteHighlight] = useDeleteHighlightMutation();
  const [updateHighlight] = useUpdateHighlightMutation();

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#FFEB3B");
  const [zoomValue, setZoomValue] = useState<PdfScaleValue>("page-width");
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<any>(null);

  /** Refs for PdfHighlighter utilities */
  const highlighterUtilsRef = useRef<PdfHighlighterUtils | null>(null);

  // Map API highlights to react-pdf-highlighter format
  const highlights = useMemo<Array<MyHighlight>>(() => {
    if (!apiHighlights) return [];
    return apiHighlights.map((h) => ({
      id: h.id,
      position: h.position,
      content: h.content,
      type: h.type,
      color: h.color,
      tags: (h as any).tags, // todo will be fixed later
      style: (h as any).style,
      noteId: (h as any).noteId,
    }));
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

  /// handlers

  // handler to delete a highlight
  const handleDeleteAllHighlight = async (highlightId: string) => {
    try {
      await deleteHighlight(highlightId).unwrap();
    } catch (error) {
      console.error("Failed to delete highlight:", error);
    }
  };
  // handler to update a highlight
  const handleUpdateAllHighlight = async (
    highlightId: string,
    highlight: Partial<CreateHighlightDto>
  ) => {
    try {
      const updated = await updateHighlight({
        id: highlightId,
        highlight,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update highlight:", error);
    }
  };
  // Handler to create a new highlight
  const handleCreateHighlight = async () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    try {
      // Generate a proper UUID for the highlight
      const highlightId = uuidv4();

      // Prepare the DTO for the API
      const newHighlightDto: CreateHighlightDto = {
        id: highlightId,
        pdfId: pdfDocument.id,
        type: selection.content.image ? "area" : "text",
        content: selection.content,
        position: selection.position,
        color: currentHighlightColor,
        hasNote: false,
        noteId: null,
      };

      // Create the highlight via API
      await createHighlight(newHighlightDto).unwrap();

      // The highlights list will automatically update via RTK Query cache
    } catch (error) {
      // Show error toast
      toast.error("Failed to create highlight. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
      console.error("Failed to create highlight:", error);
    }
  };

  // Handler to add a tag to selected text
  const handleAddTag = () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    // Store the selection and open the tag dialog
    setPendingSelection(selection);
    setIsTagDialogOpen(true);
  };

  // Handler when tags are confirmed in the dialog
  const handleTagConfirm = async (selectedTags: string[]) => {
    if (!pendingSelection) return;

    try {
      // Generate a proper UUID for the highlight
      const highlightId = uuidv4();

      // Prepare the DTO for the API with tags
      const newHighlightDto: CreateHighlightDto = {
        id: highlightId,
        pdfId: pdfDocument.id,
        type: pendingSelection.content.image ? "area" : "text",
        content: pendingSelection.content,
        position: pendingSelection.position,
        color: currentHighlightColor,
        hasNote: false,
        noteId: null,
        tags: selectedTags,
        style: "tagged",
      };

      // Create the highlight via API
      await createHighlight(newHighlightDto).unwrap();

      toast.success(`Highlight created with ${selectedTags.length} tag(s)`, {
        duration: 2000,
        position: "bottom-right",
      });

      // Clear pending selection
      setPendingSelection(null);
    } catch (error) {
      toast.error("Failed to create highlight with tags. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
      console.error("Failed to create highlight with tags:", error);
    }
  };

  // Handler to add a note to selected text
  const handleAddNote = () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    // TODO: Implement note input dialog
    console.log("Add note to selection:", selection.content.text);
    toast.success("Note feature coming soon!", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  // Handler to add selected text to summary
  const handleAddToSummary = () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    // TODO: Implement add to summary functionality
    console.log("Add to summary:", selection.content.text);
    toast.success("Summary feature coming soon!", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden ">
      {isHeaderVisible ? (
        <ViewerHeader
          pdfDocument={pdfDocument}
          isHeaderVisible={isHeaderVisible}
          setIsHeaderVisible={setIsHeaderVisible}
          pdfViewerRef={pdfViewerAdapter}
          currentHighlightColor={currentHighlightColor}
          onHighlightColorChange={setCurrentHighlightColor}
          onToggleNoter={onToggleNoter}
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

      <div className="flex-1 relative overflow-hidden [&_*::-webkit-scrollbar]:w-2 [&_*::-webkit-scrollbar]:h-2 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&_*::-webkit-scrollbar-thumb]:rounded-full hover:[&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/40 transition-colors">
        <PdfLoader
          onError={(error) => console.log(error)}
          document={pdfDocument.fileUrl as string}
          workerSrc="//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs"
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
                  onAddTag={handleAddTag}
                  onAddNote={handleAddNote}
                  onAddToSummary={handleAddToSummary}
                />
              }
              highlights={highlights}
            >
              <HighlightContainer
                onHighlightDelete={handleDeleteAllHighlight}
                onHighlightUpdate={handleUpdateAllHighlight}
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
    </div>
  );
};

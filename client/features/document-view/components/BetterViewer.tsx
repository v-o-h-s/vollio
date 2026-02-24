"use client";
import "@/app/styles/components/betterViewer.css";
import { ChevronUp, MessageSquare, FileText } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  PdfHighlighter,
  PdfHighlighterUtils,
  PdfLoader,
  PdfScaleValue,
} from "react-pdf-highlighter-extended-plus";
import { useRef } from "react";
import { ExpandableTip } from "./highlight/ExpandableTip";
import { TagSelectionDialog } from "./tags/TagSelectionDialog";
import { HighlightContainer } from "./highlight/HighlightContainer";
import { TagSidebar } from "./tags/TagSidebar";
import { DocumentLoading } from "@/components/ui/DocumentLoading";
import {
  useGetDocumentHighlightsQuery,
  useGetSettingsQuery,
} from "@/lib/store/apiSlice";
import { useSelection } from "@/features/document-view/hooks/useTextSelection";
import { useHighlightActions } from "@/features/document-view/hooks/useHighlightActions";
import { MyHighlight } from "@/features/document-view/types/highlight";
import { ViewerHeader } from "./viewheader";
import { DocumentDetails } from "../types/document";
import { useViewer } from "../context/ViewerContext";
import { ContextMenu } from "./highlight/ContextMenu";
import MinimalEditor from "./highlight/MinimalEditor";
import { cn } from "@/lib/utils";
export const BetterViewer = ({
  document,
  onToggleVollNotes,
  onToggleVollAi,
  isVollNotesOpen,
  isVollAiOpen,
  isFocused,
}: {
  document: DocumentDetails;
  onToggleVollNotes?: () => void;
  onToggleVollAi?: () => void;
  isVollNotesOpen?: boolean;
  isVollAiOpen?: boolean;
  isFocused?: boolean;
}) => {
  // Fetch highlights for this Document from API
  const { data: apiHighlights, isLoading: isLoadingHighlights } =
    useGetDocumentHighlightsQuery(document.id);

  // Fetch user settings (including tags)
  const { data: settings, isLoading: isLoadingSettings } =
    useGetSettingsQuery();
  const userTags = settings?.tags || [];

  const { updateHighlightMetadata, removeHighlight } = useHighlightActions();

  const { openNote: handleInsightClick } = useViewer();

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isTagSidebarOpen, setIsTagSidebarOpen] = useState(false);
  const [currentHighlightColor, setCurrentHighlightColor] = useState("#FFEB3B");
  const [zoomValue, setZoomValue] = useState<PdfScaleValue>("page-width");

  // Global UI state for highlights - moved here because we have problems with z value
  const [activeContextMenu, setActiveContextMenu] = useState<{
    x: number;
    y: number;
    highlightId: string;
  } | null>(null);

  const [activeVDocEditor, setActiveVDocEditor] = useState<{
    highlight: MyHighlight;
    position: { left: number; top: number };
  } | null>(null);

  /** Refs for PdfHighlighter utilities */
  const highlighterUtilsRef = useRef<PdfHighlighterUtils | null>(null);

  const {
    isTagDialogOpen,
    setIsTagDialogOpen,
    finalizeTagging,
    createSimpleHighlight,
    copySelectionToClipboard,
    initiateTagging,
    askAiToExplainSelection,
    createRichTextVDocNote,
    linkSelectionToNewVNote,
  } = useSelection({
    highlighterUtilsRef,
    document,
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
      noteContent: h.noteContent ?? undefined,
    })) as MyHighlight[];
  }, [apiHighlights]);

  // Adapter to make ViewerHeader work with react-pdf-highlighter-extended
  const documentViewerAdapter = useRef<any>({
    // Getters will be added in useEffect to access current refs
    navigation: {},
    magnification: {},
  });

  // handle copy if pressed
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c") {
        copySelectionToClipboard();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);
  // Initialize adapter methods
  useEffect(() => {
    const adapter = documentViewerAdapter.current;

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
            (highlighterUtilsRef.current?.getViewer()?.currentScale || 1) * 100,
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

  // Listen for scroll to position events from Insight component
  useEffect(() => {
    const handleScrollToPdfPosition = (
      event: CustomEvent<{ position: any }>,
    ) => {
      const { position } = event.detail;
      if (!position || !highlighterUtilsRef.current) return;

      // First, go to the correct page
      const viewer = highlighterUtilsRef.current.getViewer();
      if (viewer && position.boundingRect?.pageNumber) {
        viewer.currentPageNumber = position.boundingRect.pageNumber;

        // Then scroll to the highlight position using a temporary highlight
        setTimeout(() => {
          highlighterUtilsRef.current?.scrollToHighlight({
            id: "temp-scroll-highlight",
            position: position,
          } as any);
        }, 100);
      }
    };

    window.addEventListener(
      "scrollToPdfPosition",
      handleScrollToPdfPosition as EventListener,
    );

    return () => {
      window.removeEventListener(
        "scrollToPdfPosition",
        handleScrollToPdfPosition as EventListener,
      );
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
          document={document}
          isHeaderVisible={isHeaderVisible}
          setIsHeaderVisible={setIsHeaderVisible}
          documentViewerRef={documentViewerAdapter}
          currentHighlightColor={currentHighlightColor}
          onHighlightColorChange={setCurrentHighlightColor}
          onToggleTags={() => setIsTagSidebarOpen(!isTagSidebarOpen)}
          isTagsOpen={isTagSidebarOpen}
          onToggleVollAi={onToggleVollAi}
          isVollAiOpen={isVollAiOpen}
          onToggleVollNotes={onToggleVollNotes}
          isVollNotesOpen={isVollNotesOpen}
          isFocused={isFocused}
        />
      ) : (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 group/show-header">
          <button
            onClick={() => setIsHeaderVisible(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-b-2xl border-x border-b border-t-0",
              "bg-white/80 dark:bg-background/80 backdrop-blur-md shadow-lg",
              "text-muted-foreground hover:text-primary transition-all duration-300",
              "cursor-pointer active:scale-95 group-hover/show-header:py-2.5",
              "animate-in slide-in-from-top-4 duration-500",
              isFocused ? "border-primary/30" : "border-border/40",
            )}
          >
            <div className="flex flex-col items-center gap-0.5">
              <ChevronUp className="w-3.5 h-3.5 rotate-180" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover/show-header:opacity-100 transition-opacity">
                Show Header
              </span>
            </div>
          </button>
        </div>
      )}

      <div className="flex-1 relative overflow-hidden [&_*::-webkit-scrollbar]:w-2 [&_*::-webkit-scrollbar]:h-2 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&_*::-webkit-scrollbar-thumb]:rounded-full hover:[&_*::-webkit-scrollbar-thumb]:bg-muted-foreground/40 transition-colors">
        <PdfLoader
          onError={(error) => console.log(error)} // todo Better visualization
          document={document.documentUrl as string}
          // workerSrc="/document.worker.min.mjs"
          // //workerSrc="//cdnjs.cloudflare.com/ajax/libs/document.js/4.10.38/document.worker.min.mjs"
          beforeLoad={(progress) => <DocumentLoading progress={progress} />}
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
                  onHighlight={createSimpleHighlight} // add default highlight
                  onCopy={copySelectionToClipboard} // copy selected text
                  onAddTag={initiateTagging} // add tag to highlight
                  onExplain={askAiToExplainSelection} // explain selected text
                  onAddInsight={linkSelectionToNewVNote} // add insight to highlight
                  onSaveVDocNote={createRichTextVDocNote}
                  onAddVNote={linkSelectionToNewVNote}
                  onAddVDocNote={() => {}} // Placeholder for initial V-Doc creation if different from save
                />
              }
              highlights={highlights}
            >
              <HighlightContainer
                updateHighlight={updateHighlightMetadata}
                deleteHighlight={removeHighlight}
                onClickHighlights={handleInsightClick}
                userTags={userTags}
                onOpenContextMenu={(e, highlightId) => {
                  setActiveContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    highlightId,
                  });
                }}
                onOpenVDocEditor={(highlight, position) => {
                  setActiveVDocEditor({ highlight, position });
                }}
                activeVDocEditorId={activeVDocEditor?.highlight.id}
              />
            </PdfHighlighter>
          )}
        </PdfLoader>
      </div>

      {/* Tag Selection Dialog */}
      <TagSelectionDialog
        open={isTagDialogOpen}
        onOpenChange={setIsTagDialogOpen}
        onConfirm={finalizeTagging}
        userTags={userTags}
        isLoadingSettings={isLoadingSettings}
      />

      {/* Tag Sidebar Overlay */}
      <TagSidebar
        isOpen={isTagSidebarOpen}
        onClose={() => setIsTagSidebarOpen(false)}
        highlights={highlights}
        onScrollToHighlight={handleScrollToHighlight}
      />

      {/* Global Context Menu - Moved here because we have problems with z value */}
      {activeContextMenu && (
        <ContextMenu
          x={activeContextMenu.x}
          y={activeContextMenu.y}
          onClose={() => setActiveContextMenu(null)}
          onDelete={() => {
            removeHighlight(activeContextMenu.highlightId);
            setActiveContextMenu(null);
          }}
        />
      )}

      {/* Global VDoc Editor - Moved here because we have problems with z value */}
      {activeVDocEditor && (
        <div
          className="fixed z-1000 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            left: `${activeVDocEditor.position.left}px`,
            top: `${activeVDocEditor.position.top}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MinimalEditor
            initialValue={activeVDocEditor.highlight.noteContent || ""}
            onClose={() => setActiveVDocEditor(null)}
            onSave={async (html) => {
              try {
                await updateHighlightMetadata(activeVDocEditor.highlight.id, {
                  noteContent: html,
                });
                setActiveVDocEditor(null);
              } catch (error) {
                console.error("Failed to update note content:", error);
              }
            }}
            placeholder="Write your detailed note here..."
          />
        </div>
      )}
    </div>
  );
};

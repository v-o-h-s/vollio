"use client";

import { useParams, useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { useState, useRef, useCallback, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useGetDocumentByIdQuery } from "@/lib/store/apiSlice";
import { VollNotes } from "./notes";
import {
  DocumentLoadingState,
  DocumentErrorState,
  DocumentNotFoundState,
} from "./states";
import { useViewer } from "../context/ViewerContext";
import { ViewerComponents } from "../types/types";

const BetterViewer = dynamic(
  () => import("./BetterViewer").then((mod) => mod.BetterViewer),
  { ssr: false },
);

const VollAiChat = dynamic(
  () =>
    import("./Voll-ai/VollAiChat").then((mod) => ({
      default: mod.VollAiChat,
    })),
  { ssr: false },
);

export function DocumentViewContent() {
  const router = useRouter();
  const { id } = useParams();

  // Use context instead of local state
  const {
    isVollAiOpen,
    isVollNotesOpen,
    toggleVollAi,
    toggleVollNotes,
    focusedComponent,
    setFocusedComponent,
  } = useViewer();

  const [vollAiWidth, setVollAiWidth] = useState(25);
  const [vollNotesWidth, setVollNotesWidth] = useState(25);
  const [isVollAiDividerDragging, setIsVollAiDividerDragging] = useState(false);
  const [isVollNotesDividerDragging, setIsVollNotesDividerDragging] =
    useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Document data using RTK Query
  const {
    data: documentData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetDocumentByIdQuery(id as string);

  // Focus helper
  const handleClickComponent = useCallback(
    (component: ViewerComponents) => {
      setFocusedComponent(component);
    },
    [setFocusedComponent],
  );

  // Mouse handlers for Voll-ai divider
  const handleMouseMoveVollAi = useCallback(
    (e: MouseEvent) => {
      if (!isVollAiDividerDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newWidth = (offsetX / rect.width) * 100;

      // Constrain between 15% and 50%
      if (newWidth >= 20 && newWidth <= 50) {
        setVollAiWidth(newWidth);
      }
    },
    [isVollAiDividerDragging],
  );

  const handleMouseUpVollAi = useCallback(() => {
    setIsVollAiDividerDragging(false);
  }, []);

  const handleMouseDownVollAi = useCallback(() => {
    setIsVollAiDividerDragging(true);
  }, []);

  // Mouse handlers for Voll-notes divider
  const handleMouseMoveVollNotes = useCallback(
    (e: MouseEvent) => {
      if (!isVollNotesDividerDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const containerWidth = rect.width;

      // Calculate from the right side
      const distanceFromRight = containerWidth - offsetX;
      const newWidth = (distanceFromRight / containerWidth) * 100;

      // Constrain between 15% and 50%
      if (newWidth >= 20 && newWidth <= 50) {
        setVollNotesWidth(newWidth);
      }
    },
    [isVollNotesDividerDragging],
  );

  const handleMouseUpVollNotes = useCallback(() => {
    setIsVollNotesDividerDragging(false);
  }, []);

  const handleMouseDownVollNotes = useCallback(() => {
    setIsVollNotesDividerDragging(true);
  }, []);

  // Enhanced loading state
  if (isLoading) {
    return <DocumentLoadingState />;
  }

  // Enhanced error state
  if (isError) {
    return <DocumentErrorState error={error} refetch={refetch} />;
  }

  // No data case
  if (!documentData) {
    return <DocumentNotFoundState />;
  }

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen p-2 gap-2 relative"
      onMouseMove={(e) => {
        handleMouseMoveVollAi(e);
        handleMouseMoveVollNotes(e);
      }}
      onMouseUp={() => {
        handleMouseUpVollAi();
        handleMouseUpVollNotes();
      }}
      onMouseLeave={() => {
        handleMouseUpVollAi();
        handleMouseUpVollNotes();
      }}
    >
      {/* Left Panel: Voll-ai (when isVollAiOpen) */}
      {isVollAiOpen && (
        <>
          <div
            onClick={() => handleClickComponent(ViewerComponents.V_AI)}
            className={cn(
              "h-full rounded-lg flex flex-row overflow-hidden",
              "border bg-card shadow-md",
              focusedComponent === ViewerComponents.V_AI
                ? "border-purple-500/50 "
                : "border-primary/20",
            )}
            style={{
              width: `${vollAiWidth}%`,
            }}
          >
            <VollAiChat
              isFocused={focusedComponent === ViewerComponents.V_AI}
            />
          </div>

          {/* Divider after Voll-ai */}
          <div
            onMouseDown={handleMouseDownVollAi}
            className={cn(
              "relative flex items-center justify-center shrink-0 group",
              "transition-all duration-200 ease-in-out cursor-col-resize select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "w-2",
            )}
            style={{ cursor: "col-resize" }}
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
          >
            <div
              className={cn(
                "absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full",
                "transition-all duration-200",
                "w-0.5 bg-purple-500/30 group-hover:w-1 group-hover:bg-purple-500/80",
              )}
            />
            <div
              className={cn(
                "relative z-10 rounded-md transition-all duration-200",
                "flex items-center justify-center",
                isVollAiDividerDragging
                  ? "bg-purple-500 text-white px-0.5 py-1.5"
                  : "bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground px-0.5 py-1.5",
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
        </>
      )}

      {/* Middle Panel: BetterViewer (always visible) */}
      <div
        onClick={() => handleClickComponent(ViewerComponents.V_DOC)}
        className={cn(
          "h-full rounded-lg flex flex-row overflow-hidden",
          "border bg-card shadow-md",
          focusedComponent === ViewerComponents.V_DOC
            ? "border-primary/50 "
            : "border-primary/20",
        )}
        style={{
          width:
            isVollNotesOpen && isVollAiOpen
              ? `${100 - vollAiWidth - vollNotesWidth}%`
              : isVollNotesOpen
                ? `${100 - vollNotesWidth}%`
                : isVollAiOpen
                  ? `${100 - vollAiWidth}%`
                  : "100%",
        }}
      >
        <BetterViewer
          document={documentData}
          onToggleVollNotes={toggleVollNotes}
          onToggleVollAi={toggleVollAi}
          isVollNotesOpen={isVollNotesOpen}
          isVollAiOpen={isVollAiOpen}
          isFocused={focusedComponent === ViewerComponents.V_DOC}
        />
      </div>

      {/* Right Panel: Voll-notes (when isVollNotesOpen) */}
      {isVollNotesOpen && (
        <>
          {/* Divider before Voll-notes */}
          <div
            onMouseDown={handleMouseDownVollNotes}
            className={cn(
              "relative flex items-center justify-center shrink-0 group",
              "transition-all duration-200 ease-in-out cursor-col-resize select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "w-2",
            )}
            style={{ cursor: "col-resize" }}
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
          >
            <div
              className={cn(
                "absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full",
                "transition-all duration-200",
                isVollNotesDividerDragging
                  ? "w-1 bg-indigo-500"
                  : "w-0.5 bg-indigo-500/30 group-hover:w-1 group-hover:bg-indigo-500/80",
              )}
            />
            <div
              className={cn(
                "relative z-10 rounded-md transition-all duration-200",
                "flex items-center justify-center",
                isVollNotesDividerDragging
                  ? "bg-indigo-500 text-white scale-110 px-0.5 py-1.5"
                  : "bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground px-0.5 py-1.5",
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>

          <div
            onClick={() => handleClickComponent(ViewerComponents.V_NOTES)}
            className={cn(
              "h-full rounded-lg flex flex-row overflow-hidden",
              "border shadow-md",
              focusedComponent === ViewerComponents.V_NOTES
                ? "border-indigo-500/50 "
                : "border-primary/20",
            )}
            style={{
              width: `${vollNotesWidth}%`,
            }}
          >
            <VollNotes
              document={documentData}
              isFocused={focusedComponent === ViewerComponents.V_NOTES}
            />
          </div>
        </>
      )}
    </div>
  );
}

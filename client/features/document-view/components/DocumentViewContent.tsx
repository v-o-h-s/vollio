"use client";

import { useParams, useRouter } from "next/navigation";
import { GripVertical } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useGetDocumentByIdQuery } from "@/lib/store/apiSlice";
import { Noter } from "./notes";
import {
  DocumentLoadingState,
  DocumentErrorState,
  DocumentNotFoundState,
} from "./states";
import { useViewer } from "../context/ViewerContext";
import { ViewerComponents } from "../types/types";

const BetterViewer = dynamic(
  () => import("./BetterViewer").then((mod) => mod.BetterViewer),
  { ssr: false }
);

const AssistantChat = dynamic(
  () =>
    import("./Assistant/AssistantChat").then((mod) => ({
      default: mod.AssistantChat,
    })),
  { ssr: false }
);

export function DocumentViewContent() {
  const router = useRouter();
  const { id } = useParams();

  // Use context instead of local state
  const {
    isAssistantOpen,
    isNoterOpen,
    toggleAssistant,
    toggleNoter,
    focusedComponent,
    setFocusedComponent,
  } = useViewer();

  const [assistantWidth, setAssistantWidth] = useState(25);
  const [noterWidth, setNoterWidth] = useState(25);
  const [isAssistantDividerDragging, setIsAssistantDividerDragging] =
    useState(false);
  const [isNoterDividerDragging, setIsNoterDividerDragging] = useState(false);
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
  const handleClickComponent = useCallback((component: ViewerComponents) => {
    setFocusedComponent(component);
  }, [setFocusedComponent]);

  // Mouse handlers for Assistant divider
  const handleMouseMoveAssistant = useCallback(
    (e: MouseEvent) => {
      if (!isAssistantDividerDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newWidth = (offsetX / rect.width) * 100;

      // Constrain between 15% and 50%
      if (newWidth >= 20 && newWidth <= 50) {
        setAssistantWidth(newWidth);
      }
    },
    [isAssistantDividerDragging]
  );

  const handleMouseUpAssistant = useCallback(() => {
    setIsAssistantDividerDragging(false);
  }, []);

  const handleMouseDownAssistant = useCallback(() => {
    setIsAssistantDividerDragging(true);
  }, []);

  // Mouse handlers for Noter divider
  const handleMouseMoveNoter = useCallback(
    (e: MouseEvent) => {
      if (!isNoterDividerDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const containerWidth = rect.width;

      // Calculate from the right side
      const distanceFromRight = containerWidth - offsetX;
      const newWidth = (distanceFromRight / containerWidth) * 100;

      // Constrain between 15% and 50%
      if (newWidth >= 20 && newWidth <= 50) {
        setNoterWidth(newWidth);
      }
    },
    [isNoterDividerDragging]
  );

  const handleMouseUpNoter = useCallback(() => {
    setIsNoterDividerDragging(false);
  }, []);

  const handleMouseDownNoter = useCallback(() => {
    setIsNoterDividerDragging(true);
  }, []);

  // Add document-level event listeners for dragging
  useEffect(() => {
    if (isAssistantDividerDragging) {
      document.addEventListener("mousemove", handleMouseMoveAssistant);
      document.addEventListener("mouseup", handleMouseUpAssistant);
    } else {
      document.removeEventListener("mousemove", handleMouseMoveAssistant);
      document.removeEventListener("mouseup", handleMouseUpAssistant);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMoveAssistant);
      document.removeEventListener("mouseup", handleMouseUpAssistant);
    };
  }, [
    isAssistantDividerDragging,
    handleMouseMoveAssistant,
    handleMouseUpAssistant,
  ]);

  useEffect(() => {
    if (isNoterDividerDragging) {
      document.addEventListener("mousemove", handleMouseMoveNoter);
      document.addEventListener("mouseup", handleMouseUpNoter);
    } else {
      document.removeEventListener("mousemove", handleMouseMoveNoter);
      document.removeEventListener("mouseup", handleMouseUpNoter);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMoveNoter);
      document.removeEventListener("mouseup", handleMouseUpNoter);
    };
  }, [isNoterDividerDragging, handleMouseMoveNoter, handleMouseUpNoter]);

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
    >
      {/* Left Panel: AI Assistant (when isAssistantOpen) */}
      {isAssistantOpen && (
        <>
          <div
            onClick={() => handleClickComponent(ViewerComponents.V_AI)}
            className={cn(
              "h-full rounded-lg flex flex-row overflow-hidden transition-all duration-300",
              "border bg-card shadow-md",
              focusedComponent === ViewerComponents.V_AI
                ? "border-purple-500/50 "
                : "border-primary/20"
            )}
            style={{
              width: `${assistantWidth}%`,
            }}
          >
            <AssistantChat isFocused={focusedComponent === ViewerComponents.V_AI} />
          </div>

          {/* Divider after assistant */}
          <div
            onMouseDown={handleMouseDownAssistant}
            className={cn(
              "relative flex items-center justify-center shrink-0 group",
              "transition-all duration-200 ease-in-out cursor-col-resize select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isAssistantDividerDragging ? "w-8" : "w-2 hover:w-8"
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
                isAssistantDividerDragging
                  ? "w-1 bg-purple-500"
                  : "w-0.5 bg-purple-500/30 group-hover:w-1 group-hover:bg-purple-500/80"
              )}
            />
            <div
              className={cn(
                "relative z-10 rounded-md transition-all duration-200",
                "flex items-center justify-center",
                isAssistantDividerDragging
                  ? "bg-purple-500 text-white scale-110 px-1 py-2"
                  : "bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground px-0.5 py-1.5"
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
          "h-full rounded-lg flex flex-row overflow-hidden transition-all duration-300",
          "border bg-card shadow-md",
          focusedComponent === ViewerComponents.V_DOC
            ? "border-primary/50 "
            : "border-primary/20"
        )}
        style={{
          width:
            isNoterOpen && isAssistantOpen
              ? `${100 - assistantWidth - noterWidth}%`
              : isNoterOpen
              ? `${100 - noterWidth}%`
              : isAssistantOpen
              ? `${100 - assistantWidth}%`
              : "100%",
        }}
      >
        <BetterViewer
          document={documentData}
          onToggleNoter={toggleNoter}
          onToggleAssistant={toggleAssistant}
          isNoterOpen={isNoterOpen}
          isAssistantOpen={isAssistantOpen}
          isFocused={focusedComponent === ViewerComponents.V_DOC}
        />
      </div>

      {/* Right Panel: Noter (when isNoterOpen) */}
      {isNoterOpen && (
        <>
          {/* Divider before Noter */}
          <div
            onMouseDown={handleMouseDownNoter}
            className={cn(
              "relative flex items-center justify-center shrink-0 group",
              "transition-all duration-200 ease-in-out cursor-col-resize select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isNoterDividerDragging ? "w-8" : "w-2 hover:w-8"
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
                isNoterDividerDragging
                  ? "w-1 bg-indigo-500"
                  : "w-0.5 bg-indigo-500/30 group-hover:w-1 group-hover:bg-indigo-500/80"
              )}
            />
            <div
              className={cn(
                "relative z-10 rounded-md transition-all duration-200",
                "flex items-center justify-center",
                isNoterDividerDragging
                  ? "bg-indigo-500 text-white scale-110 px-1 py-2"
                  : "bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground px-0.5 py-1.5"
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>

          <div
            onClick={() => handleClickComponent(ViewerComponents.V_NOTES)}
            className={cn(
              "h-full rounded-lg flex flex-row overflow-hidden transition-all duration-300",
              "border shadow-md",
              focusedComponent === ViewerComponents.V_NOTES
                ? "border-indigo-500/50 "
                : "border-primary/20"
            )}
            style={{
              width: `${noterWidth}%`,
            }}
          >
            <Noter
              document={documentData}
              isFocused={focusedComponent === ViewerComponents.V_NOTES}
            />
          </div>
        </>
      )}
    </div>
  );
}
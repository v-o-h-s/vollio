"use client";
import { useParams, useRouter } from "next/navigation";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import {
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw,
  ArrowLeft,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useGetFileByIdQuery } from "@/lib/store/apiSlice";
import { Noter } from "@/features/file-view/components/notes";

const BetterViewer = dynamic(
  () =>
    import("@/features/file-view/components/BetterViewer").then(
      (mod) => mod.BetterViewer
    ),
  { ssr: false }
);

const AssistantChat = dynamic(
  () =>
    import("@/features/file-view/components/Assistant/AssistantChat").then(
      (mod) => ({ default: mod.AssistantChat })
    ),
  { ssr: false }
);

export default function PDFPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isNoterOpen, setIsNoteOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantWidth, setAssistantWidth] = useState(25);
  const [noterWidth, setNoterWidth] = useState(25);
  const [isAssistantDividerDragging, setIsAssistantDividerDragging] =
    useState(false);
  const [isNoterDividerDragging, setIsNoterDividerDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch PDF data using RTK Query
  const {
    data: fileData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFileByIdQuery(id as string);

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
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-[200px] w-[400px]">
        <div className="flex flex-col items-center space-y-4 overflow-x-auto max-w-full">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <FileText className="w-12 h-12 text-primary/20" />
            </div>
            <FileText className="w-12 h-12 text-primary relative z-10" />
          </div>

          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-lg font-medium text-foreground">
              Loading your file
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center wrap-break-word">
            Preparing your document for viewing
          </p>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (isError) {
    const message =
      error && "status" in error
        ? ((error as FetchBaseQueryError).data as { message?: string })?.message
        : (error as SerializedError)?.message;

    const statusCode =
      error && "status" in error ? (error as FetchBaseQueryError).status : null;

    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center space-y-4 w-[400px]">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-foreground">
              {statusCode === 404 ? "PDF Not Found" : "Error Loading PDF"}
            </h3>
            <p className="text-base mt-2 text-muted-foreground wrap-break-word">
              {message ?? "Failed to load PDF. Please try again."}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => refetch()}
              variant="default"
              className="gap-2 w-full"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/dashboard/pdfs")}
              variant="outline"
              className="gap-2 w-full"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to PDFs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No data case
  if (!fileData) {
    return (
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center space-y-4 w-[400px]">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground">
              No PDF Data
            </h3>
            <p className="text-sm text-muted-foreground mt-2 break-words">
              Unable to load the requested PDF document.
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/pdfs")}
            variant="default"
            className="w-full gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to PDFs
          </Button>
        </div>
      </div>
    );
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
            className={cn(
              "h-full rounded-lg flex flex-row overflow-hidden",
              "border border-border bg-card",
              "shadow-md",
              "transition-none"
            )}
            style={{
              width: isNoterOpen ? `${assistantWidth}%` : `${assistantWidth}%`,
            }}
          >
            <AssistantChat />
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
                  ? "w-1 bg-primary"
                  : "w-0.5 bg-border group-hover:w-1 group-hover:bg-primary/80"
              )}
            />
            <div
              className={cn(
                "relative z-10 rounded-md transition-all duration-200",
                "flex items-center justify-center",
                isAssistantDividerDragging
                  ? "bg-primary text-primary-foreground scale-110 px-1 py-2"
                  : "bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground px-0.5 py-1.5"
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12",
                "pointer-events-none z-20 whitespace-nowrap",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "bg-popover text-popover-foreground text-xs px-2 py-1",
                "rounded-md border border-border"
              )}
            >
              Drag to resize
            </div>
          </div>
        </>
      )}

      {/* Middle Panel: BetterViewer (always visible) */}
      <div
        className={cn(
          "h-full rounded-lg flex flex-row overflow-hidden",
          "border border-border bg-card",
          "shadow-md",
          "transition-none"
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
          file={fileData}
          onToggleNoter={() => setIsNoteOpen(!isNoterOpen)}
          onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
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
                  ? "w-1 bg-primary"
                  : "w-0.5 bg-border group-hover:w-1 group-hover:bg-primary/80"
              )}
            />
            <div
              className={cn(
                "relative z-10 rounded-md transition-all duration-200",
                "flex items-center justify-center",
                isNoterDividerDragging
                  ? "bg-primary text-primary-foreground scale-110 px-1 py-2"
                  : "bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground px-0.5 py-1.5"
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <div
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12",
                "pointer-events-none z-20 whitespace-nowrap",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "bg-popover text-popover-foreground text-xs px-2 py-1",
                "rounded-md border border-border"
              )}
            >
              Drag to resize
            </div>
          </div>

          <div
            className={cn(
              "h-full rounded-lg flex flex-row overflow-hidden pt-1 relative",
              "border border-border",
              "shadow-md",
              "transition-none"
            )}
            style={{
              width: `${noterWidth}%`,
            }}
          >
            <Noter file={fileData} />
          </div>
        </>
      )}
    </div>
  );
}

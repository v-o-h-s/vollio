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

const BetterViewer = dynamic(
  () =>
    import("@/features/file-view/components/BetterViewer").then(
      (mod) => mod.BetterViewer
    ),
  { ssr: false }
);

const Noter = dynamic(() => import("@/features/file-view/components/Noter"), {
  ssr: false,
});
export default function PDFPage() {
  const router = useRouter();
  const { id } = useParams();
  const [isNoterOpen, setIsNoteOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch PDF data using RTK Query
  const {
    data: fileData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFileByIdQuery(id as string);
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const newLeftWidth = (offsetX / containerRect.width) * 100;

      // Constrain between 20% and 80%
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
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
          <p className="text-sm text-muted-foreground text-center break-words">
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
            <p className="text-base mt-2 text-muted-foreground break-words">
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
      {/* PDF Viewer Panel */}
      <div
        className={cn(
          "h-full rounded-[var(--radius)] flex flex-row overflow-hidden",
          "border border-border bg-card",
          "shadow-md",
          "transition-none"
        )}
        style={{
          width: isNoterOpen
            ? `calc(${leftWidth}% - ${isDragging ? "16px" : "4px"})`
            : "100%",
        }}
      >
        <BetterViewer
          file={fileData}
          onToggleNoter={() => setIsNoteOpen(!isNoterOpen)}
        />
      </div>

      {isNoterOpen && (
        <>
          {/* Resizable Divider */}
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              "relative flex items-center justify-center flex-shrink-0 group",
              "transition-all duration-200 ease-in-out cursor-col-resize select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isDragging ? "w-8" : "w-2 hover:w-8"
            )}
            style={{ cursor: "col-resize" }}
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
          >
            {/* Simple Bar */}
            <div
              className={cn(
                "absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full",
                "transition-all duration-200",
                isDragging
                  ? "w-1 bg-primary"
                  : "w-0.5 bg-border group-hover:w-1 group-hover:bg-primary/80"
              )}
            />

            {/* Grip Icon */}
            <div
              className={cn(
                "relative z-10 rounded-md transition-all duration-200",
                "flex items-center justify-center",
                isDragging
                  ? "bg-primary text-primary-foreground scale-110 px-1 py-2"
                  : "bg-transparent text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:bg-accent group-hover:text-accent-foreground px-0.5 py-1.5"
              )}
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Simple Tooltip */}
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

          {/* Noter Panel */}
          <div
            className={cn(
              "h-full rounded-[var(--radius)] flex flex-row overflow-hidden pt-1 relative",
              "border border-border ",
              "shadow-md",
              "transition-none"
            )}
            style={{
              width: `calc(${100 - leftWidth}% - ${
                isDragging ? "32px" : "8px"
              })`,
            }}
          >
            <Noter file={fileData} />
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useCallback } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Loader2, AlertCircle, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploadViewProps extends NodeViewProps {
  node: NodeViewProps["node"] & {
    attrs: {
      src?: string | null;
      alt?: string | null;
      title?: string | null;
      width?: number | null;
      height?: number | null;
      loading?: boolean;
      error?: string | null;
    };
  };
}

export function ImageUploadView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: ImageUploadViewProps) {
  const { src, alt, title, width, height, loading, error } = node.attrs;
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const imageRef = useRef<HTMLImageElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current && !width && !height) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      const maxWidth = 600;
      const aspectRatio = naturalHeight / naturalWidth;
      const newWidth = Math.min(naturalWidth, maxWidth);
      const newHeight = newWidth * aspectRatio;

      updateAttributes({
        width: newWidth,
        height: newHeight,
      });
    }
  }, [width, height, updateAttributes]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, corner: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      setIsResizing(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      });

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = dragStart.width;
        let newHeight = dragStart.height;

        if (corner.includes("right")) {
          newWidth = Math.max(100, dragStart.width + deltaX);
        }
        if (corner.includes("left")) {
          newWidth = Math.max(100, dragStart.width - deltaX);
        }
        if (corner.includes("bottom")) {
          newHeight = Math.max(60, dragStart.height + deltaY);
        }
        if (corner.includes("top")) {
          newHeight = Math.max(60, dragStart.height - deltaY);
        }

        // Maintain aspect ratio when dragging corners
        if (corner.includes("right") || corner.includes("left")) {
          const aspectRatio = dragStart.height / dragStart.width;
          newHeight = newWidth * aspectRatio;
        }

        updateAttributes({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [dragStart, isResizing, updateAttributes],
  );

  const handleDocumentSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const document = e.target.files?.[0];
      if (!document) return;

      // Validate document type
      if (!document.type.startsWith("image/")) {
        updateAttributes({ error: "Please select an image document" });
        return;
      }

      // Validate document size (10MB)
      if (document.size > 10 * 1024 * 1024) {
        updateAttributes({ error: "Image must be smaller than 10MB" });
        return;
      }

      // Start upload
      updateAttributes({ loading: true, error: null });

      const formData = new FormData();
      formData.append("document", document);

      fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            updateAttributes({
              src: data.data.url,
              alt: document.name,
              loading: false,
              error: null,
            });
          } else {
            updateAttributes({
              loading: false,
              error: data.error || "Upload failed",
            });
          }
        })
        .catch((error) => {
          console.error("Upload error:", error);
          updateAttributes({
            loading: false,
            error: "Upload failed",
          });
        });
    },
    [updateAttributes],
  );

  // Loading state
  if (loading) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading image...</span>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="flex items-center justify-between p-4 border-2 border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => documentInputRef.current?.click()}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={deleteNode}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            ref={documentInputRef}
            type="file"
            accept="image/*"
            onChange={handleDocumentSelect}
            className="hidden"
          />
        </div>
      </NodeViewWrapper>
    );
  }

  // Empty state (no src)
  if (!src) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload an image or drag and drop
            </p>
            <button
              onClick={() => documentInputRef.current?.click()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Choose Image
            </button>
            <input
              ref={documentInputRef}
              type="file"
              accept="image/*"
              onChange={handleDocumentSelect}
              className="hidden"
            />
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Image display with resize handles
  return (
    <NodeViewWrapper className="my-4">
      <div
        className={cn(
          "relative inline-block group",
          selected && "ring-2 ring-primary ring-offset-2 rounded",
        )}
        style={{ width: width || "auto", height: height || "auto" }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt || ""}
          title={title || undefined}
          onLoad={handleImageLoad}
          className="block max-w-full h-auto rounded-lg shadow-sm"
          style={{ width: width || "auto", height: height || "auto" }}
          draggable={false}
        />

        {/* Resize handles - only show when selected */}
        {selected && (
          <>
            {/* Corner handles */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-background rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, "top-left")}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-background rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, "top-right")}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-background rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
            />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-background rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
            />

            {/* Delete button */}
            <button
              onClick={deleteNode}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

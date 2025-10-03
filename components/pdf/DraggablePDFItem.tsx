"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MoreVertical } from "lucide-react";
import { safeFormatDistanceToNow } from "@/lib/utils/dates";
import { PDFDocument } from "@/lib/types/pdf";
import { ViewMode } from "./PDFDirectoryView";

interface DraggablePDFItemProps {
  pdf: PDFDocument;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: (isCtrlClick: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOpen: () => void;
  isDragging?: boolean;
}

export function DraggablePDFItem({
  pdf,
  viewMode,
  isSelected,
  onSelect,
  onContextMenu,
  onOpen,
  isDragging = false,
}: DraggablePDFItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: pdf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "PDF";
  };

  if (viewMode === "grid") {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card
          {...listeners}
          className={`cursor-pointer transition-all hover:shadow-md ${
            isSelected ? "ring-2 ring-primary" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
          onContextMenu={onContextMenu}
          onDoubleClick={onOpen}
        >
          <CardContent className="p-4">
            <div className="aspect-square mb-3 bg-muted rounded-lg flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <Badge variant="secondary" className="text-xs">
                {getFileExtension(pdf.filename)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm truncate" title={pdf.filename}>
                {pdf.filename}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{formatFileSize(pdf.fileSize)}</span>
                <span>{safeFormatDistanceToNow(pdf.uploadedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div
          {...listeners}
          className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isSelected ? "bg-primary/10" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
          onContextMenu={onContextMenu}
          onDoubleClick={onOpen}
        >
          <div className="flex flex-col items-center text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-1" />
            <p
              className="text-xs font-medium truncate w-full"
              title={pdf.filename}
            >
              {pdf.filename}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(pdf.fileSize)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "details") {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div
          {...listeners}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isSelected ? "bg-primary/10" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
          onContextMenu={onContextMenu}
          onDoubleClick={onOpen}
        >
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0 grid grid-cols-4 gap-4">
            <p className="font-medium truncate">{pdf.filename}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(pdf.fileSize)}
            </p>
            <p className="text-sm text-muted-foreground">
              {getFileExtension(pdf.filename)}
            </p>
            <p className="text-sm text-muted-foreground">
              {safeFormatDistanceToNow(pdf.uploadedAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onContextMenu(e);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default list view
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? "bg-primary/10" : ""
        } ${isDragging ? "opacity-50" : ""}`}
        onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
        onContextMenu={onContextMenu}
        onDoubleClick={onOpen}
      >
        <div className="w-10 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{pdf.filename}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatFileSize(pdf.fileSize)}</span>
            <span>{safeFormatDistanceToNow(pdf.uploadedAt)}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
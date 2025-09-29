"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, FolderOpen } from "lucide-react";

interface PDFUploadZoneProps {
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  isDragOver: boolean;
  currentFolder: string | null;
  className?: string;
}

export function PDFUploadZone({
  onDrop,
  onDragOver,
  onDragLeave,
  isDragOver,
  currentFolder,
  className
}: PDFUploadZoneProps) {
  if (!isDragOver) return null;

  return (
    <Card 
      className={`border-2 border-dashed border-primary bg-primary/5 transition-all ${className}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <Upload className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Drop PDFs here to upload</h3>
        <p className="text-muted-foreground text-center">
          {currentFolder 
            ? "Files will be uploaded to the current folder" 
            : "Files will be uploaded to the root directory"}
        </p>
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>PDF files only</span>
          {currentFolder && (
            <>
              <span>•</span>
              <FolderOpen className="h-4 w-4" />
              <span>Current folder</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
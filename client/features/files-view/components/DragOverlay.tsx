"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderOpen } from "lucide-react";
import { PDFDocument } from "@/lib/types/pdf";

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  pdf_count?: number;
}

interface DragOverlayContentProps {
  activeId: string;
  folders: Folder[];
  pdfs: PDFDocument[];
}

export function DragOverlayContent({ activeId, folders, pdfs }: DragOverlayContentProps) {
  const folder = folders.find(f => f.id === activeId);
  const pdf = pdfs.find(p => p.id === activeId);

  if (folder) {
    return (
      <Card className="opacity-90 rotate-3 shadow-lg">
        <CardContent className="p-4">
          <div className="aspect-square mb-3 bg-muted/30 rounded-lg flex items-center justify-center">
            <FolderOpen className="h-12 w-12 text-primary" />
          </div>
          <p className="font-medium text-sm truncate">{folder.name}</p>
        </CardContent>
      </Card>
    );
  }

  if (pdf) {
    return (
      <Card className="opacity-90 rotate-3 shadow-lg">
        <CardContent className="p-4">
          <div className="aspect-square mb-3 bg-muted rounded-lg flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
            <Badge variant="secondary" className="text-xs">
              {pdf.filename.split(".").pop()?.toUpperCase() || "PDF"}
            </Badge>
          </div>
          <p className="font-medium text-sm truncate">{pdf.filename}</p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
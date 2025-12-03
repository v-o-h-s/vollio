"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home, Folder } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

interface PDFBreadcrumbProps {
  path: Folder[];
  onNavigate: (folderId: string | null) => void;
  className?: string;
}

export function PDFBreadcrumb({ path, onNavigate, className }: PDFBreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`}>
      {/* Root/Home */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 hover:bg-muted"
        onClick={() => onNavigate(null)}
      >
        <Home className="h-4 w-4 mr-1" />
        <span>PDFs</span>
      </Button>

      {/* Path segments */}
      {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 hover:bg-muted ${
              index === path.length - 1 
                ? "text-foreground font-medium" 
                : "text-muted-foreground"
            }`}
            onClick={() => onNavigate(folder.id)}
          >
            <Folder className="h-4 w-4 mr-1" />
            <span className="truncate max-w-32">{folder.name}</span>
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
}
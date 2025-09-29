"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, List } from "lucide-react";

type ViewMode = "grid" | "list";

interface PDFViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function PDFViewToggle({ viewMode, onViewModeChange, className }: PDFViewToggleProps) {
  return (
    <div className={`flex items-center border rounded-lg ${className}`}>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        className="rounded-r-none border-r"
        onClick={() => onViewModeChange("grid")}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        className="rounded-l-none"
        onClick={() => onViewModeChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
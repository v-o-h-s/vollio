"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Grid3X3, 
  List, 
  LayoutGrid, 
  AlignJustify,
  ChevronDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = "grid" | "list" | "compact" | "details";

interface PDFViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const viewModeConfig = {
  grid: { icon: Grid3X3, label: "Grid" },
  list: { icon: List, label: "List" },
  compact: { icon: LayoutGrid, label: "Compact" },
  details: { icon: AlignJustify, label: "Details" },
};

export function PDFViewToggle({ viewMode, onViewModeChange, className }: PDFViewToggleProps) {
  const CurrentIcon = viewModeConfig[viewMode].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <CurrentIcon className="h-4 w-4 mr-2" />
          {viewModeConfig[viewMode].label}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(viewModeConfig).map(([mode, config]) => {
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => onViewModeChange(mode as ViewMode)}
              className={viewMode === mode ? "bg-accent" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
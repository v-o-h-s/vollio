"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, List, LayoutList, Table } from "lucide-react";

export type ViewMode = "grid" | "list" | "compact" | "details";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const viewModeConfig = {
  grid: { icon: LayoutGrid, label: "Grid" },
  list: { icon: List, label: "List" },
  compact: { icon: LayoutList, label: "Compact" },
  details: { icon: Table, label: "Details" },
};

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  const CurrentIcon = viewModeConfig[viewMode].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <CurrentIcon className="h-4 w-4 mr-2" />
          {viewModeConfig[viewMode].label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(viewModeConfig).map(([key, { icon: Icon, label }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onViewModeChange(key as ViewMode)}
            className="cursor-pointer"
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

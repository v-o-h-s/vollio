"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

export interface FileFilters {
  showPDFs: boolean;
  showDocs: boolean;
  showImages: boolean;
  showGoogleDrive: boolean;
  showLocal: boolean;
}

interface FilterDropdownProps {
  filters: FileFilters;
  onFiltersChange: (filters: FileFilters) => void;
}

export function FilterDropdown({ filters, onFiltersChange }: FilterDropdownProps) {
  const handleFilterChange = (key: keyof FileFilters, value: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>File Types</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.showPDFs}
          onCheckedChange={(checked) => handleFilterChange("showPDFs", checked)}
        >
          PDF Documents
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.showDocs}
          onCheckedChange={(checked) => handleFilterChange("showDocs", checked)}
        >
          Documents
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.showImages}
          onCheckedChange={(checked) => handleFilterChange("showImages", checked)}
        >
          Images
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Source</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.showGoogleDrive}
          onCheckedChange={(checked) => handleFilterChange("showGoogleDrive", checked)}
        >
          Google Drive
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.showLocal}
          onCheckedChange={(checked) => handleFilterChange("showLocal", checked)}
        >
          Local Files
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

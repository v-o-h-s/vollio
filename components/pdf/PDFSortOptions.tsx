"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Calendar,
  FileText,
  HardDrive,
  Type
} from "lucide-react";

type SortBy = "name" | "date" | "size" | "type";
type SortOrder = "asc" | "desc";

interface PDFSortOptionsProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  className?: string;
}

export function PDFSortOptions({ 
  sortBy, 
  sortOrder, 
  onSortChange, 
  className 
}: PDFSortOptionsProps) {
  const sortOptions = [
    { value: "name", label: "Name", icon: Type },
    { value: "date", label: "Date Modified", icon: Calendar },
    { value: "size", label: "File Size", icon: HardDrive },
    { value: "type", label: "File Type", icon: FileText }
  ] as const;

  const currentSort = sortOptions.find(option => option.value === sortBy);
  const SortIcon = sortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
          {currentSort && (
            <>
              <span className="mx-1">•</span>
              <currentSort.icon className="h-3 w-3 mr-1" />
              <span className="text-xs">{currentSort.label}</span>
              <SortIcon className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Sort by
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup 
          value={sortBy} 
          onValueChange={(value) => onSortChange(value as SortBy, sortOrder)}
        >
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="h-4 w-4 mr-2" />
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Order
        </div>
        <DropdownMenuItem 
          onClick={() => onSortChange(sortBy, "asc")}
          className={sortOrder === "asc" ? "bg-accent" : ""}
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          Ascending
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onSortChange(sortBy, "desc")}
          className={sortOrder === "desc" ? "bg-accent" : ""}
        >
          <ArrowDown className="h-4 w-4 mr-2" />
          Descending
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
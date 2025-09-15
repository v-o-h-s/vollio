"use client";

/**
 * PDFs Page Component
 *
 * A dedicated page for viewing and managing all user's uploaded PDFs.
 * Uses the PDFListDisplay component to provide a modern, grid-based interface.
 * Follows the dashboard design system with consistent styling and theming.
 *
 * Features:
 * - Modern grid layout of all user PDFs
 * - Upload functionality with drag-and-drop
 * - Search and filtering capabilities
 * - Pagination for large collections
 * - Click to open PDFs in annotation viewer
 *
 * @author Noto Team
 * @version 1.0.0
 */

import { useState } from "react";
import { Search, Filter, Grid, List, Upload, Plus, SortDesc, MoreHorizontal, FolderOpen } from "lucide-react";
import { PDFListDisplay } from "@/components/pdf";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PDFsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            PDF Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your documents
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-8"
          >
            <FolderOpen size={14} />
            <span className="hidden sm:inline">Organize</span>
          </Button>
          <Button 
            size="sm"
            className="flex items-center gap-2 h-8"
          >
            <Plus size={14} />
            Upload PDF
          </Button>
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-sm placeholder:text-muted-foreground transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 h-8"
                >
                  <SortDesc size={14} />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Name A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("size")}>
                  File Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter */}
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 h-8"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-md p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-sm transition-colors ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid view"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-sm transition-colors ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Select All
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Export List
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Bulk Actions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* PDF List Display */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <PDFListDisplay className="" showUpload={true} />
      </div>

      {/* Stats Footer */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total Documents: 0</span>
            <span>Total Size: 0 MB</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Last Updated: Never</span>
          </div>
        </div>
      </div>
    </div>
  );
}

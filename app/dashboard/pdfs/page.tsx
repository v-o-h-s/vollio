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
import { Search, Filter, Grid, List, Upload, Plus, SortDesc, MoreHorizontal, FolderOpen, FileText, HardDrive } from "lucide-react";
import { PDFListDisplay } from "@/components/pdf";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";

export default function PDFsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [isDragOver, setIsDragOver] = useState(false);

  // Get PDF data for stats
  const { data: pdfData } = useGetPDFsQuery();
  const pdfs = pdfData?.pdfs || [];
  const totalCount = pdfData?.totalCount || 0;

  // Calculate total size
  const totalSize = pdfs.reduce((acc, pdf) => acc + (pdf.fileSize || 0), 0);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Global drag handlers for animation
  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only hide if leaving the entire page area
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div 
      className={`space-y-6 transition-all duration-300 ${isDragOver ? 'bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl' : ''}`}
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* Drag overlay animation */}
      {isDragOver && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-2xl max-w-md mx-auto text-center animate-pulse">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-primary animate-bounce" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Drop to Upload</h3>
            <p className="text-muted-foreground">Release to upload your PDF document</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            PDF Library
          </h1>
          <p className="text-sm text-muted-foreground/80">
            Manage and organize your documents
          </p>
          {/* Stats */}
          {totalCount > 0 && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground/70 mt-2">
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span>{totalCount} {totalCount === 1 ? 'document' : 'documents'}</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive size={12} />
                <span>{formatFileSize(totalSize)} total</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-9 px-4 border-border/30 hover:border-border/50 hover:bg-card/40 backdrop-blur-sm rounded-lg"
          >
            <FolderOpen size={14} />
            <span className="hidden sm:inline">Organize</span>
          </Button>
          <Button 
            size="sm"
            className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus size={14} />
            Upload PDF
          </Button>
        </div>
      </div>

      {/* Enhanced Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60"
            />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-border/30 rounded-lg focus:ring-2 focus:ring-ring/40 focus:border-ring/40 focus:bg-card/20 text-sm placeholder:text-muted-foreground/50 transition-all duration-200 hover:border-border/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 h-9 px-3 border-border/30 hover:border-border/50 hover:bg-card/40 backdrop-blur-sm rounded-lg"
                >
                  <SortDesc size={14} />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border/50 rounded-xl shadow-xl">
                <DropdownMenuItem onClick={() => setSortBy("recent")} className="hover:bg-accent/30 rounded-lg">
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")} className="hover:bg-accent/30 rounded-lg">
                  Name A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("size")} className="hover:bg-accent/30 rounded-lg">
                  File Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")} className="hover:bg-accent/30 rounded-lg">
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter */}
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 h-9 px-3 border-border/30 hover:border-border/50 hover:bg-card/40 backdrop-blur-sm rounded-lg"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-card/40 backdrop-blur-sm rounded-lg p-1 border border-border/30">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-background/70 text-foreground shadow-sm border border-border/30"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-background/30"
                }`}
                title="Grid view"
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-background/70 text-foreground shadow-sm border border-border/30"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-background/30"
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
                  className="h-9 w-9 p-0 border-border/30 hover:border-border/50 hover:bg-card/40 backdrop-blur-sm rounded-lg"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border/50 rounded-xl shadow-xl">
                <DropdownMenuItem className="hover:bg-accent/30 rounded-lg">
                  Select All
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent/30 rounded-lg">
                  Export List
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent/30 rounded-lg">
                  Bulk Actions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      {/* PDF List Display */}
      <PDFListDisplay className="" showUpload={true} />
    </div>
  );
}

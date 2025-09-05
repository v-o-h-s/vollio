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
import { Search, Filter, Grid, List, Upload, Plus } from "lucide-react";
import { PDFListDisplay } from "@/components/pdf";
import { Button } from "@/components/ui/button";

export default function PDFsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Your PDFs
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage and organize your PDF documents
          </p>
        </div>
        
        <Button 
          className="flex items-center gap-2 px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-normal hover-lift"
        >
          <Plus size={18} />
          Upload PDF
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter size={18} />
            Filter
          </Button>

          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* PDF List Display */}
      <PDFListDisplay className="mt-8" showUpload={true} />
    </div>
  );
}

"use client";

import React, { useRef, useEffect } from "react";
import { PDFDirectoryView } from "@/components/pdf/views/PDFDirectoryView";
import { Search } from "lucide-react";
import { useFloatingSidebarIntegration } from "@/hooks/use-floating-sidebar";

export default function PDFsPage() {
  // Refs to interact with PDFDirectoryView
  const pdfDirectoryRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Integrate with floating sidebar
  useFloatingSidebarIntegration({
    uploadPDF: () => {
      // Trigger upload dialog
      const uploadEvent = new CustomEvent("pdf-upload-trigger");
      document.dispatchEvent(uploadEvent);
    },
    createFolder: () => {
      // Trigger folder creation
      const folderEvent = new CustomEvent("pdf-folder-create");
      document.dispatchEvent(folderEvent);
    },
    searchFiles: () => {
      // Focus search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    filterFiles: () => {
      // Trigger filter panel - this would need to be implemented
      const filterEvent = new CustomEvent("pdf-filter-toggle");
      document.dispatchEvent(filterEvent);
    },
    toggleView: () => {
      // Trigger view mode toggle - this would need to be implemented in PDFDirectoryView
      const viewEvent = new CustomEvent("pdf-view-toggle");
      document.dispatchEvent(viewEvent);
    },
  });

  return (
    <div className="   space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Files library</h1>
          <p className="text-muted-foreground text-sm">
            Manage your documents with file system-style navigation
          </p>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files..."
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* PDF Directory View */}
      <PDFDirectoryView />
    </div>
  );
}

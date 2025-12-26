"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

interface PageNavigationProps {
  documentViewerRef?: React.RefObject<any>;
}

export function PageNavigation({ documentViewerRef }: PageNavigationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("1");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update page info from Document viewer
  React.useEffect(() => {
    if (documentViewerRef?.current) {
      const viewer = documentViewerRef.current;

      // Get current page and total pages from Syncfusion Document Viewer
      const updatePageInfo = () => {
        try {
          const current = viewer.currentPageNumber || 1;
          const total = viewer.pageCount || 1;
          setCurrentPage(current);
          setTotalPages(total);
        } catch (error) {
          console.warn("Could not get page info from Document viewer:", error);
        }
      };

      // Update immediately
      updatePageInfo();

      // Set up interval to keep page info updated
      const interval = setInterval(updatePageInfo, 1000);
      return () => clearInterval(interval);
    }
  }, [documentViewerRef]);

  const handlePageClick = () => {
    setIsEditing(true);
    setInputValue(currentPage.toString());
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputSubmit = () => {
    const pageNum = parseInt(inputValue);
    if (pageNum >= 1 && pageNum <= totalPages && documentViewerRef?.current) {
      try {
        // Use navigation API to go to page
        if (documentViewerRef.current.navigation) {
          documentViewerRef.current.navigation.goToPage(pageNum);
        } else {
          // Fallback method
          documentViewerRef.current.goToPage(pageNum);
        }
        setCurrentPage(pageNum);
      } catch (error) {
        console.error("Error navigating to page:", error);
      }
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(currentPage.toString());
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 text-xs">
      {isEditing ? (
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputSubmit}
          onKeyDown={handleInputKeyDown}
          className="w-10 sm:w-12 h-6 text-xs text-center bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 rounded px-1"
        />
      ) : (
        <button
          onClick={handlePageClick}
          className="font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-white/10 dark:hover:bg-white/5"
          title="Click to edit page number"
        >
          {currentPage}
        </button>
      )}
      <span className="text-foreground/60">/</span>
      <span className="font-medium text-foreground/80">{totalPages}</span>
    </div>
  );
}

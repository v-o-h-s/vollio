"use client";

import React from "react";
import { SearchBar } from "./SearchBar";
import { ViewToggle, ViewMode } from "./ViewToggle";
import { School, Upload, FolderPlus } from "lucide-react";

interface DocumentsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  classroomLabel: string;
  onClassroomClick: () => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
}

export function DocumentsToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  classroomLabel,
  onClassroomClick,
  onUploadClick,
  onCreateFolderClick,
}: DocumentsToolbarProps) {
  const buttonBaseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    height: "2.5rem",
    padding: "0 1rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
    border: "1px solid", // Common border
  };

  const outlineButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: "white",
    borderColor: "#e5e5e5",
    color: "#171717",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: "#171717",
    borderColor: "#171717",
    color: "white",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search documents and folders..."
        className="" // Layout managed by parent flex
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onUploadClick}
          style={outlineButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f5f5f5")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
        >
          <Upload size={16} />
          Upload Document
        </button>
        <button
          onClick={onCreateFolderClick}
          style={outlineButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f5f5f5")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
        >
          <FolderPlus size={16} />
          New Folder
        </button>
        <button
          onClick={onClassroomClick}
          style={primaryButtonStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#262626")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#171717")
          }
        >
          <School size={16} />
          {classroomLabel}
        </button>
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </div>
  );
}

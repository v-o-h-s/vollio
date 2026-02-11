"use client";

import React, { useState } from "react";
import { DocumentsContent } from "./dashboard-preview/DocumentsContent";
import { Breadcrumb } from "./dashboard-preview/Breadcrumb";
import { DocumentsToolbar } from "./dashboard-preview/DocumentsToolbar";
import { ViewMode } from "./dashboard-preview/ViewToggle";
import { FloatingNavigation } from "./dashboard-preview/FloatingNavigation";
import { mockFolders, mockFiles } from "../mockData";

export default function DashboardPreview() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const folders = mockFolders;
  const documents = mockFiles;

  return (
    <>
      <div
        style={{
          padding: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: "0.5rem",
          position: "relative",
          minHeight: "600px",
          paddingBottom: "6rem",
          backgroundColor: "white",
          color: "#171717",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              marginBottom: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <h1
              style={{
                fontSize: "2.25rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "#171717",
                lineHeight: 1,
              }}
            >
              Documents Library
            </h1>
            <p style={{ color: "#737373", margin: 0 }}>
              Manage your documents with document system-style navigation
            </p>
            <DocumentsToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              classroomLabel="Connect LMS"
              onClassroomClick={() => {}}
              onUploadClick={() => {}}
              onCreateFolderClick={() => {}}
            />
          </div>

          <Breadcrumb
            path={[{ id: "documents", name: "Documents" }]}
            onNavigate={() => {}}
          />
        </div>

        <DocumentsContent
          viewMode={viewMode}
          folders={folders}
          documents={documents}
          isItemSelected={() => false}
          onItemSelect={() => {}}
          onFolderOpen={() => {}}
          onDocumentOpen={() => {}}
          onEmptyAreaClick={() => {}}
          dragOverFolderId={null}
          allFolders={folders}
        />
        <FloatingNavigation disableAnimation />
      </div>
      <FloatingNavigation />
    </>
  );
}

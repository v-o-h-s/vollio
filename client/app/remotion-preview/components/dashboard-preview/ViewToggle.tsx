"use client";

import React, { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const CurrentIcon = viewModeConfig[viewMode].icon;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: 500,
          height: "2.25rem", // sm height
          padding: "0 0.75rem",
          backgroundColor: "white",
          border: "1px solid #e5e5e5",
          color: "#171717",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#f5f5f5")
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
      >
        <CurrentIcon size={16} style={{ marginRight: "0.5rem" }} />
        {viewModeConfig[viewMode].label}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: "0.25rem",
              width: "8rem",
              backgroundColor: "white",
              border: "1px solid #e5e5e5",
              borderRadius: "0.375rem",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              zIndex: 50,
              padding: "0.25rem",
            }}
          >
            {Object.entries(viewModeConfig).map(
              ([key, { icon: Icon, label }]) => (
                <button
                  key={key}
                  onClick={() => {
                    onViewModeChange(key as ViewMode);
                    setIsOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "0.5rem",
                    fontSize: "0.875rem",
                    color: "#171717",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f5f5f5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Icon size={16} style={{ marginRight: "0.5rem" }} />
                  {label}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}

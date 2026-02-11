"use client";

import React from "react";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface BreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    height: "2rem",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    backgroundColor: "transparent",
    border: "none",
    color: "#737373", // neutral-500
    cursor: "pointer",
    transition: "color 0.2s, background-color 0.2s",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        fontSize: "0.875rem",
        overflowX: "auto",
        paddingBottom: "0.5rem",
        paddingTop: "0.5rem",
      }}
    >
      <button
        onClick={() => onNavigate(null)}
        style={{ ...buttonStyle }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#171717";
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#737373";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Home size={16} />
      </button>
      {path.map((item, index) => (
        <div
          key={item.id || "root"}
          style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
        >
          <ChevronRight size={16} color="#a3a3a3" />
          <button
            onClick={() => onNavigate(item.id)}
            style={{
              ...buttonStyle,
              color: "#171717",
              // Disabled style
              ...(index === path.length - 1
                ? { opacity: 0.5, cursor: "default" }
                : {}),
            }}
            disabled={index === path.length - 1}
            onMouseEnter={(e) => {
              if (index !== path.length - 1) {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }
            }}
            onMouseLeave={(e) => {
              if (index !== path.length - 1) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
}

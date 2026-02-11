"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // Kept for compat, applied to container
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search documents...",
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={className} // Applying className if passed (e.g. width/flex props from parent might be passed via className string, but parent is also being refactored so ideally style prop)
      style={{
        position: "relative",
        // If parent passes flex classes, we unfortunately lose them if we don't parse className or accept style.
        // But I'll assume parent (DocumentsToolbar) handles layout via container styles or passes styles.
        // DocumentsToolbar used `flex-1 max-w-md` in className.
        flex: 1,
        maxWidth: "28rem",
      }}
    >
      <Search
        style={{
          position: "absolute",
          left: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#737373",
          width: "1rem",
          height: "1rem",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: "2.5rem",
          paddingLeft: "2.5rem",
          paddingRight: "2.5rem",
          backgroundColor: "white",
          border: "1px solid #e5e5e5",
          borderRadius: "0.375rem",
          color: "#171717",
          outline: "none",
          fontSize: "0.875rem",
          fontFamily: "inherit",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#171717")}
        onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            right: "0.25rem",
            top: "50%",
            transform: "translateY(-50%)",
            height: "1.75rem",
            width: "1.75rem",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: "none",
            color: "#737373",
            cursor: "pointer",
            borderRadius: "0.25rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#737373")}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

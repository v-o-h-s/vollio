"use client";

import React, { useState } from "react";
import {
  Copy,
  Highlighter,
  Tag,
  NotebookPen,
  Bot,
  Check,
  MoreHorizontal,
} from "lucide-react";

interface TextHighlightToolbarProps {
  onCopy?: () => void;
  onHighlight?: () => void;
  onTag?: () => void;
  onNote?: () => void;
  onExplain?: () => void;
}

export function TextHighlightToolbar({
  onCopy = () => {},
  onHighlight = () => {},
  onTag = () => {},
  onNote = () => {},
  onExplain = () => {},
}: TextHighlightToolbarProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleCopy = () => {
    onCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const buttonStyle = (isActive: boolean, color: string = "#171717") => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "9999px",
    border: "1px solid transparent",
    backgroundColor: isActive ? color : "transparent",
    color: isActive ? "white" : "#171717",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    margin: "0 0.125rem",
  });

  const separatorStyle = {
    width: "1px",
    height: "1.5rem",
    backgroundColor: "rgba(0,0,0,0.1)",
    margin: "0 0.5rem",
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.375rem",
        borderRadius: "9999px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
      className="animate-in fade-in zoom-in duration-300"
    >
      {/* Copy */}
      <div style={{ position: "relative" }}>
        <button
          onClick={handleCopy}
          style={{
            ...buttonStyle(isCopied, "#22c55e"),
            ...(isCopied ? { borderColor: "#22c55e" } : {}),
          }}
          onMouseEnter={(e) => {
            if (!isCopied) e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            if (!isCopied)
              e.currentTarget.style.backgroundColor = "transparent";
          }}
          title="Copy Text"
        >
          {isCopied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>

      {/* Highlight */}
      <button
        onClick={onHighlight}
        style={buttonStyle(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(234, 179, 8, 0.1)"; // yellow-500/10
          e.currentTarget.style.color = "#ca8a04"; // yellow-600
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#171717";
        }}
        title="Highlight"
      >
        <Highlighter size={18} />
      </button>

      {/* Tag */}
      <button
        onClick={onTag}
        style={buttonStyle(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(115, 115, 115, 0.1)"; // neutral-500/10
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
        title="Categorize"
      >
        <Tag size={18} />
      </button>

      {/* Note */}
      <button
        onClick={() => {
          setActiveButton(activeButton === "note" ? null : "note");
          onNote();
        }}
        style={buttonStyle(activeButton === "note", "#6366f1")} // indigo-500
        onMouseEnter={(e) => {
          if (activeButton !== "note") {
            e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.1)";
            e.currentTarget.style.color = "#4f46e5";
          }
        }}
        onMouseLeave={(e) => {
          if (activeButton !== "note") {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#171717";
          }
        }}
        title="Add Note"
      >
        <NotebookPen size={18} />
      </button>

      <div style={separatorStyle} />

      {/* Explain (AI) */}
      <button
        onClick={onExplain}
        style={buttonStyle(false)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(168, 85, 247, 0.1)"; // purple-500/10
          e.currentTarget.style.color = "#9333ea"; // purple-600
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#171717";
        }}
        title="AI Explain"
      >
        <Bot size={18} />
      </button>
    </div>
  );
}

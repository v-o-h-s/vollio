"use client";

import React, { useState } from "react";
import { TextHighlightToolbar } from "./dashboard-preview/TextHighlightToolbar";
import { ChatSidebar } from "./dashboard-preview/ChatSidebar";
import { NotesSidebar } from "./dashboard-preview/NotesSidebar";
import {
  FileText,
  Tag,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  NotebookPen,
  Sparkles,
} from "lucide-react";

export default function DocumentViewerPreview() {
  const [selection, setSelection] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [showHighlights, setShowHighlights] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Fake text content
  const handleTextClick = (e: React.MouseEvent) => {
    if (selection) {
      setSelection(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelection({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 60,
      });
    }
  };

  const toolbarButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid #e5e7eb",
    backgroundColor: "white",
    color: "#374151",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const bottomButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1.5rem",
    borderRadius: "9999px",
    backgroundColor: "white",
    color: "#1f2937",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #f3f4f6",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "85vh",
        margin: "0",
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderRadius: "0.5rem",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Ensure toolbar stays at top
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          zIndex: 10,
        }}
      >
        {/* Left: File Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#e0e7ff",
              color: "#4f46e5",
            }}
          >
            <FileText size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Cellular Biology.pdf
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              2.4 MB • Updated just now
            </div>
          </div>
        </div>

        {/* Center: Page Indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "white",
            padding: "0.25rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <button
            style={{
              padding: "0.25rem",
              borderRadius: "0.25rem",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
              minWidth: "4rem",
              textAlign: "center",
            }}
          >
            Page 4
          </span>
          <button
            style={{
              padding: "0.25rem",
              borderRadius: "0.25rem",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            style={toolbarButtonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            <Tag size={16} />
            Tags
          </button>
          <button
            onClick={() => setShowHighlights(!showHighlights)}
            style={toolbarButtonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            {showHighlights ? <Eye size={16} /> : <EyeOff size={16} />}
            {showHighlights ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Main Layout: Chat + Content + Notes */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Chat Sidebar (Left) */}
        {showChat && <ChatSidebar onClose={() => setShowChat(false)} />}

        {/* Document Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4rem 2rem",
            position: "relative",
            backgroundColor: showChat || showNotes ? "#fcfcfc" : "white",
          }}
        >
          <div style={{ maxWidth: "65ch", margin: "0 auto" }}>
            <div style={{ marginBottom: "2rem" }}>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  color: "#171717",
                  lineHeight: 1.2,
                }}
              >
                Cellular Biology
              </h1>
              <div style={{ fontSize: "1rem", color: "#737373" }}>
                Chapter 4: Organelles
              </div>
            </div>

            <div
              style={{
                fontSize: "1.25rem",
                lineHeight: "1.8",
                color: "#333",
                position: "relative",
                cursor: "text",
              }}
              onClick={handleTextClick}
            >
              <p style={{ marginBottom: "2rem" }}>
                The{" "}
                <span
                  style={{
                    backgroundColor:
                      selection && showHighlights
                        ? "rgba(99, 102, 241, 0.2)"
                        : "transparent",
                    transition: "background-color 0.2s",
                  }}
                >
                  mitochondria is known as the powerhouse of the cell
                </span>
                . It is a double-membrane-bound organelle found in most
                eukaryotic organisms. Mitochondria generate most of the cell's
                supply of adenosine triphosphate (ATP), used as a source of
                chemical energy.
              </p>
              <p>
                A mitochondrion contains outer and inner membranes composed of
                phospholipid bilayers and proteins. The two membranes have
                different properties. Because of this double-membraned
                organization, there are five distinct parts to a mitochondrion.
              </p>

              {selection && (
                <div
                  style={{
                    position: "absolute",
                    left: "0px",
                    top: "-60px",
                    zIndex: 50,
                    animation: "fadeIn 0.2s ease-out",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <TextHighlightToolbar
                    onCopy={() => console.log("Copy")}
                    onHighlight={() => console.log("Highlight")}
                    onTag={() => console.log("Tag")}
                    onNote={() => console.log("Note")}
                    onExplain={() => console.log("Explain")}
                  />
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#9ca3af",
              marginTop: "4rem",
            }}
          >
            Click text to view interaction toolbar
          </div>
          {/* Bottom spacer */}
          <div style={{ height: "4rem" }}></div>
        </div>

        {/* Notes Sidebar (Right) */}
        {showNotes && <NotesSidebar onClose={() => setShowNotes(false)} />}
      </div>

      {/* Bottom Floating Buttons */}
      {/* Calculation for Left Position:
           Start at 50%.
           If Chat is open (left side, width 30rem), center shifts right by 15rem.
           If Notes is open (right side, width 35rem), center shifts left by 17.5rem.
           Combined shift = (ChatOpen ? 15rem : 0) - (NotesOpen ? 17.5rem : 0).
       */}
      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          left: `calc(50% + ${(showChat ? 15 : 0) - (showNotes ? 17.5 : 0)}rem)`,
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          zIndex: 20,
          transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <button
          onClick={() => setShowNotes(!showNotes)}
          style={{
            ...bottomButtonStyle,
            ...(showNotes
              ? { backgroundColor: "#eff6ff", borderColor: "#3b82f6" }
              : {}),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
          }}
        >
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              backgroundColor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3b82f6",
            }}
          >
            <NotebookPen size={18} />
          </div>
          <span style={{ color: "#374151" }}>
            {showNotes ? "Close Notes" : "My Notes"}
          </span>
        </button>

        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            ...bottomButtonStyle,
            ...(showChat
              ? { backgroundColor: "#f5f3ff", borderColor: "#8b5cf6" }
              : {}),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
          }}
        >
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              backgroundColor: "#f5f3ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8b5cf6",
            }}
          >
            <Sparkles size={18} />
          </div>
          <span style={{ color: "#374151" }}>
            {showChat ? "Close Assistant" : "Ask AI Assistant"}
          </span>
        </button>
      </div>
    </div>
  );
}

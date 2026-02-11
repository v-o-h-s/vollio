"use client";

import React from "react";
import {
  X,
  MoreHorizontal,
  Heading,
  List,
  CheckSquare,
  Image as ImageIcon,
  Type,
  Code,
  Check,
} from "lucide-react";

interface NotesSidebarProps {
  onClose: () => void;
}

export function NotesSidebar({ onClose }: NotesSidebarProps) {
  return (
    <div
      style={{
        width: "35rem", // Slightly wider for editor feel
        height: "100%",
        backgroundColor: "white",
        borderLeft: "1px solid #e5e5e5",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
      }}
    >
      {/* Header (Notion-like top bar) */}
      <div
        style={{
          padding: "0.75rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#37352f",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "#37352f80",
          }}
        >
          <span>Biology Notes</span>
          <span>/</span>
          <span>Cell Structure</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <button
            style={{
              padding: "0.25rem",
              borderRadius: "0.25rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#37352f",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(55, 53, 47, 0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <MoreHorizontal size={20} />
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.25rem",
              borderRadius: "0.25rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#37352f",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(55, 53, 47, 0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2rem 3rem" }}>
        {/* Cover/Icon placeholders if we wanted, skipping for now to focus on text */}

        {/* Title */}
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginTop: "1rem",
            marginBottom: "1rem",
            color: "#37352f",
            lineHeight: 1.2,
          }}
        >
          Cellular Respiration Notes
        </h1>

        {/* Metadata properties (visual mock) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ width: "6rem", color: "#37352f80" }}>
              Created by
            </span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <div
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  borderRadius: "50%",
                  backgroundColor: "#fbbf24",
                }}
              ></div>
              <span>User</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ width: "6rem", color: "#37352f80" }}>Tags</span>
            <span
              style={{
                padding: "0.25rem 0.5rem",
                backgroundColor: "rgba(235, 87, 87, 0.1)",
                color: "#eb5757",
                borderRadius: "0.25rem",
                fontSize: "0.85rem",
              }}
            >
              Biology
            </span>
          </div>
        </div>

        <hr
          style={{
            border: "none",
            borderBottom: "1px solid #e5e5e5",
            marginBottom: "2rem",
          }}
        />

        {/* Content Blocks */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            color: "#37352f",
            lineHeight: "1.5",
          }}
        >
          <p>
            Mitochondria are the powerhouses of the cell. They generate ATP
            through:
          </p>

          <ul
            style={{
              paddingLeft: "1.5rem",
              listStyleType: "disc",
              marginBottom: "1rem",
            }}
          >
            <li>Glycolysis (Cytoplasm)</li>
            <li>Krebs Cycle (Matrix)</li>
            <li>Electron Transport Chain (Inner Membrane)</li>
          </ul>

          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginTop: "1.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Key Concepts
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0",
            }}
          >
            <div
              style={{
                width: "1rem",
                height: "1rem",
                border: "2px solid #37352f",
                borderRadius: "0.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Check size={16} color="#37352f" />
            </div>
            <span
              style={{ textDecoration: "line-through", color: "#37352f80" }}
            >
              Review membrane structure
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0",
            }}
          >
            <div
              style={{
                width: "1rem",
                height: "1rem",
                border: "2px solid #37352f",
                borderRadius: "0.2rem",
              }}
            />
            <span>Memorize ATP synthase function</span>
          </div>

          {/* The "Slash Command" Simulation */}
          <div style={{ position: "relative", marginTop: "1rem" }}>
            <p>/</p>

            {/* The Menu */}
            <div
              style={{
                position: "absolute",
                top: "1.5rem",
                left: "0",
                width: "18rem",
                backgroundColor: "white",
                borderRadius: "0.4rem",
                boxShadow:
                  "0 0 0 1px rgba(15, 15, 15, 0.05), 0 3px 6px rgba(15, 15, 15, 0.1), 0 9px 24px rgba(15, 15, 15, 0.2)",
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#37352f80",
                }}
              >
                BASIC BLOCKS
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  backgroundColor: "#37352f0f",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #e5e5e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                  }}
                >
                  <Type size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    Text
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#37352f80" }}>
                    Just start writing with plain text.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #e5e5e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                  }}
                >
                  <Heading size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    Heading 1
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#37352f80" }}>
                    Big section heading.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #e5e5e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                  }}
                >
                  <List size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    Bulleted list
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#37352f80" }}>
                    Create a simple bulleted list.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "0.25rem",
                    border: "1px solid #e5e5e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                  }}
                >
                  <CheckSquare size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    To-do list
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#37352f80" }}>
                    Track tasks with a to-do list.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

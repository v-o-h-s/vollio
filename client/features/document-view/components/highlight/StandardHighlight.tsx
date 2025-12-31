"use client";

import { MyHighlight } from "@/features/document-view/types/highlight";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface StandardHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color: string;
  onClickHighlights?: (noteId: string) => void;
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const StandardHighlight = ({
  highlight,
  isScrolledTo,
  color,
  onClickHighlights,
}: StandardHighlightProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Normalize rects once and convert to DOM coordinates
  const rects = useMemo(() => {
    const raw = highlight.position?.rects ?? [];
    return raw.map((r: any) => {
      return {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
      };
    });
  }, [highlight.position?.rects]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!highlight.noteId || !onClickHighlights) return;
    onClickHighlights(highlight.noteId);
  };

  if (!rects || rects.length === 0) return null;

  return (
    <>
      {rects.map((rect, idx) => (
        <div
          key={`overlay-${idx}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          style={{
            position: "absolute",
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            backgroundColor: hexToRgba(color, 0.25),
            mixBlendMode: "multiply",
            borderRadius: "3px",
            cursor: "pointer",
            pointerEvents: "auto",
            zIndex: 5,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Subtle gradient overlay on hover */}
          <div
            className={cn(
              "absolute inset-0 rounded-[3px] pointer-events-none transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: `linear-gradient(to right, ${hexToRgba(color, 0.1)}, ${hexToRgba(color, 0.2)}, ${hexToRgba(color, 0.1)})`,
              mixBlendMode: "screen",
            }}
          />

          {/* Glow effect on hover */}
          <div
            className={cn(
              "absolute inset-0 rounded-[3px] pointer-events-none transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              boxShadow: `0 0 15px ${hexToRgba(color, 0.5)}, 0 0 30px ${hexToRgba(color, 0.25)}`,
              border: `1px solid ${hexToRgba(color, 0.7)}`,
              transform: isHovered ? "scale(1.02)" : "scale(1)",
            }}
          />

          {/* Shimmer effect */}
          {isHovered && (
            <div
              className="absolute inset-0 rounded-[3px] pointer-events-none overflow-hidden"
              style={{ mixBlendMode: "overlay" }}
            >
              <div
                className="absolute inset-0 animate-shimmer"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  transform: "translateX(-100%)",
                }}
              />
            </div>
          )}

          {/* Pulse animation ring when scrolled to */}
          {isScrolledTo && (
            <div
              className="absolute inset-0 rounded-[3px] animate-ping pointer-events-none"
              style={{
                border: `2px solid ${hexToRgba(color, 0.6)}`,
                animationDuration: "2s",
                animationIterationCount: "3",
              }}
            />
          )}
        </div>
      ))}
    </>
  );
};

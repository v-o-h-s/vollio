"use client";

import { TextHighlight } from "react-pdf-highlighter-extended-plus";
import { MyHighlight } from "@/features/document-view/types/highlight";
import { useState, useMemo, useEffect, useRef } from "react";
import { RiRobot3Fill as Sparkles } from "react-icons/ri";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface InsightHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color?: string;
  onClickHighlights: (noteId: string) => void;
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const InsightHighlight = ({
  highlight,
  isScrolledTo,
  color = "#8B5CF6", // Default to purple/primary color for insights
  onClickHighlights,
}: InsightHighlightProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate rects in DOM coordinates (scale + page offset)
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

  // Calculate badge position at the end of the last rect
  const badgePosition = useMemo(() => {
    if (!rects || rects.length === 0) return null;

    const lastRect = rects[rects.length - 1];
    const badgeSize = 20;
    const gap = 4;

    let left = lastRect.left + lastRect.width + gap;
    let top = lastRect.top - gap;

    // Clamp to page width if provided
    if (typeof window !== "undefined") {
      const maxLeft = window.innerWidth - (badgeSize + 8);
      left = Math.min(left, maxLeft);
    }

    return { left, top, size: badgeSize };
  }, [rects]);

  // GSAP animation for badge hover
  useEffect(() => {
    if (!badgeRef.current) return;

    if (isHovered) {
      gsap.to(badgeRef.current, {
        scale: 1.25,
        rotation: 12,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(badgeRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

  // GSAP animation for tooltip
  useEffect(() => {
    if (!tooltipRef.current) return;

    if (isHovered) {
      gsap.fromTo(
        tooltipRef.current,
        {
          opacity: 0,
          y: 10,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        }
      );
    }
  }, [isHovered]);

  const handleClick = (e: React.MouseEvent) => {
    console.log("highlight clicked")
    if (!highlight.noteId) return;
    onClickHighlights(highlight.noteId);
  };

  if (!rects || rects.length === 0) return null;

  return (
    <>
      {/* Render highlight overlays for each rect */}
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
          {/* Animated gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 rounded-[3px] pointer-events-none transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{
              background:
                "linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.2))",
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
              boxShadow: `0 0 20px ${hexToRgba(
                color,
                0.6
              )}, 0 0 40px ${hexToRgba(color, 0.3)}`,
              border: `1px solid ${hexToRgba(color, 0.8)}`,
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

      {/* Corner badge indicator - positioned at end of last rect */}
      {badgePosition && (
        <div
          ref={badgeRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
          className="absolute rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-gray-900 shadow-lg"
          style={{
            left: `${badgePosition.left}px`,
            top: `${badgePosition.top}px`,
            width: `${badgePosition.size}px`,
            height: `${badgePosition.size}px`,
            background:
              "linear-gradient(to bottom right, rgb(168, 85, 247), rgb(139, 92, 246))",
            pointerEvents: "auto",
            zIndex: 20,
          }}
        >
          <Sparkles size={10} className="text-white drop-shadow-sm" />

        
        </div>
      )}
    </>
  );
};

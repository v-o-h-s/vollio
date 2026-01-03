"use client";

import { MyHighlight } from "@/features/document-view/types/highlight";
import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import MinimalEditor from "./MinimalEditor";
import { LuFilePenLine as FilePenLine } from "react-icons/lu";
import { CreateHighlightDTO } from "@vollio/shared";
import gsap from "gsap";

interface VDocHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color: string;
  updateHighlight: (
    highlightId: string,
    highlight: Partial<CreateHighlightDTO>
  ) => Promise<any>;
  onOpenEditor: (
    highlight: MyHighlight,
    position: { left: number; top: number }
  ) => void;
  isEditorOpen: boolean;
}

const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const VDocHighlight = ({
  highlight,
  isScrolledTo,
  color = "#4F46E5",
  updateHighlight,
  onOpenEditor,
  isEditorOpen,
}: VDocHighlightProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const rects = useMemo(() => {
    const raw = highlight.position?.rects ?? [];
    return raw.map((r: any) => ({
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
    }));
  }, [highlight.position?.rects]);

  // Calculate badge position at the end of the last rect
  const badgePosition = useMemo(() => {
    if (!rects || rects.length === 0) return null;

    const lastRect = rects[rects.length - 1];
    const badgeSize = 20;
    const gap = 4;

    let left = lastRect.left + lastRect.width + gap;
    let top = lastRect.top - gap;

    // Clamp to page width
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
    e.stopPropagation();
    // Calculate global position to solve z-index (z-value) problems
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenEditor(highlight, {
      left: rect.left + rect.width / 2,
      top: rect.top + rect.height + 15,
    });
  };

  if (!rects || rects.length === 0) return null;

  return (
    <>
      {rects.map((rect, idx) => (
        <div
          key={`vdoc-overlay-${idx}`}
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
            cursor: isEditorOpen ? "default" : "pointer",
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
              background: `linear-gradient(to right, ${hexToRgba(
                color,
                0.2
              )}, ${hexToRgba(color, 0.2)})`,
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

      {/* Badge anchored at the end of last rect */}
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
            background: `linear-gradient(to bottom right, ${color}, ${hexToRgba(
              color,
              0.8
            )})`,
            pointerEvents: "auto",
            zIndex: 20,
          }}
        >
          <FilePenLine size={10} className="text-white drop-shadow-sm" />

          {/* Tooltip on hover */}
          {isHovered && (
            <div
              ref={tooltipRef}
              className="absolute rounded-lg shadow-2xl border border-indigo-400/30 w-[140px] flex flex-row items-center justify-center"
              style={{
                bottom: `${badgePosition.size + 8}px`,
                left: "50%",
                transform: "translateX(-50%)",
                background: `linear-gradient(to right, ${color}, ${hexToRgba(
                  color,
                  0.9
                )})`,
                zIndex: 50,
                padding: "8px 12px",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 500,
                color: "#ffffff",
              }}
            >
              <FilePenLine size={12} className="text-white/80" />
              <div className="font-semibold">V-Doc</div>

              {/* Tooltip arrow */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: "8px",
                  height: "8px",
                  background: color,
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* MinimalEditor moved to BetterViewer level because we have problems with z value */}
    </>
  );
};

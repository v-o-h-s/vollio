"use client";

import { TextHighlight } from "react-pdf-highlighter-extended-plus";
import { MyHighlight } from "@/features/document-view/types/highlight";
import { useState } from "react";
import { RiRobot3Line as Sparkles } from "react-icons/ri";
import { cn } from "@/lib/utils";

interface InsightHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color?: string;
  onNavigateToInsight?: () => void;
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
  onNavigateToInsight,
}: InsightHighlightProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigateToInsight?.();
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className="relative cursor-pointer group"
      title="Click to view AI insight in notes"
    >
      {/* Main highlight with gradient overlay */}
      <div className="relative">
        <TextHighlight
          highlight={highlight as any}
          isScrolledTo={isScrolledTo}
          style={{
            backgroundColor: hexToRgba(color, 0.25),
            mixBlendMode: "multiply",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            borderRadius: "3px",
            position: "relative",
          }}
        />

        {/* Animated gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-[3px] pointer-events-none transition-opacity duration-300",
            "bg-linear-to-r from-purple-500/20 via-violet-500/20 to-fuchsia-500/20",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{
            mixBlendMode: "screen",
          }}
        />

        {/* Glow effect on hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-[3px] pointer-events-none transition-all duration-300",
            isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
          )}
          style={{
            boxShadow: `0 0 20px ${hexToRgba(color, 0.6)}, 0 0 40px ${hexToRgba(
              color,
              0.3
            )}`,
            border: `1px solid ${hexToRgba(color, 0.8)}`,
          }}
        />

        {/* Shimmer effect */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-[3px] pointer-events-none overflow-hidden"
            style={{ mixBlendMode: "overlay" }}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/30 to-transparent" />
          </div>
        )}
      </div>

      {/* Corner badge indicator */}
      <div
        className={cn(
          "absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center",
          "transition-all duration-300 z-10",
          "bg-linear-to-br from-purple-500 to-violet-600",
          "border-2 border-white dark:border-gray-900",
          "shadow-lg",
          isHovered ? "scale-125 rotate-12" : "scale-100 rotate-0"
        )}
      >
        <Sparkles size={10} className="text-white drop-shadow-sm" />
      </div>

      {/* Enhanced tooltip on hover */}
      {isHovered && (
        <div
          className={cn(
            "absolute -top-12 left-1/2 -translate-x-1/2",
            "flex items-center gap-2 px-3 py-2",
            "bg-linear-to-r from-purple-600 to-violet-600",
            "text-white",
            "rounded-lg shadow-2xl text-sm font-medium",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
            "whitespace-nowrap z-50",
            "border border-purple-400/30",
            "backdrop-blur-sm"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-semibold">AI Insight</span>
          </div>
          <div className="w-px h-4 bg-white/30" />
          <span className="text-purple-100">Click to view in notes</span>

          {/* Tooltip arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-linear-to-br from-purple-600 to-violet-600 rotate-45 border-r border-b border-purple-400/30" />
        </div>
      )}

      {/* Pulse animation ring when scrolled to */}
      {isScrolledTo && (
        <div className="absolute inset-0 rounded-[3px] pointer-events-none">
          <div
            className="absolute inset-0 rounded-[3px] animate-ping"
            style={{
              border: `2px solid ${hexToRgba(color, 0.6)}`,
              animationDuration: "2s",
              animationIterationCount: "3",
            }}
          />
        </div>
      )}
    </div>
  );
};

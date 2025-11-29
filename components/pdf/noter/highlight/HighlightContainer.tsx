"use client";

import { useHighlightContainerContext } from "react-pdf-highlighter-extended";
import { TextHighlight } from "react-pdf-highlighter-extended";
import { HighlightWithColor } from "../BetterViewer";
import { useState, useRef, useEffect } from "react";

import toast from "react-hot-toast";
import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import { Button, Card } from "@/components/ui";

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Color palette for changing highlight colors
const HIGHLIGHT_COLORS = [
  { name: "Yellow", hex: "#FFEB3B" },
  { name: "Green", hex: "#4CAF50" },
  { name: "Blue", hex: "#2196F3" },
  { name: "Orange", hex: "#FF9800" },
  { name: "Pink", hex: "#E91E63" },
  { name: "Purple", hex: "#9C27B0" },
];

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  currentColor?: string;
}

const ContextMenu = ({
  x,
  y,
  onClose,
  onDelete,
  onChangeColor,
  currentColor,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
      style={{ top: y, left: x }}
    >
      {/* Delete option */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Delete Highlight
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

      {/* Color options */}
      <div className="px-4 py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Change Color
        </p>
        <div className="grid grid-cols-3 gap-2">
          {HIGHLIGHT_COLORS.map((colorOption) => (
            <button
              key={colorOption.hex}
              onClick={(e) => {
                e.stopPropagation();
                onChangeColor(colorOption.hex);
                onClose();
              }}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                currentColor?.toUpperCase() === colorOption.hex
                  ? "border-gray-900 dark:border-white ring-2 ring-gray-300 dark:ring-gray-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              style={{ backgroundColor: colorOption.hex }}
              title={colorOption.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
 
};
interface HighlightContainerProps {
  onHighlightDelete: (highlightId: string) => Promise<void>;
  onHighlightUpdate: (
    highlightId: string,
    highlight: Partial<CreateHighlightDto>
  ) => Promise<void>;
}

export const HighlightContainer = ({
  onHighlightDelete,
  onHighlightUpdate,
}: HighlightContainerProps) => {
  const { highlight, isScrolledTo } =
    useHighlightContainerContext<HighlightWithColor>();

  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (!highlight) return null;

  // Access custom properties
  const color = (highlight as any).color;

  // Adjust opacity based on hover state
  const baseOpacity = 0.4;
  const hoveredOpacity = 0.25;
  const currentOpacity = isHovered ? hoveredOpacity : baseOpacity;

  const backgroundColor = color
    ? hexToRgba(color, currentOpacity)
    : `rgba(255, 235, 59, ${currentOpacity})`;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDelete = async () => {
    try {
      await onHighlightDelete(highlight.id);
      toast.success("Highlight deleted", {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to delete highlight", {
        duration: 3000,
        position: "bottom-right",
      });
      console.error("Failed to delete highlight:", error);
    }
  };

  const handleChangeColor = async (newColor: string) => {
    try {
      await onHighlightUpdate(highlight.id, { color: newColor });
      toast.success("Highlight color updated", {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to update color", {
        duration: 3000,
        position: "bottom-right",
      });
      console.error("Failed to update highlight color:", error);
    }
  };

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
        style={{ cursor: "pointer" }}
      >
        <TextHighlight
          highlight={highlight}
          isScrolledTo={isScrolledTo}
          style={{
            backgroundColor,
            mixBlendMode: "multiply",
            transition: "background-color 0.2s ease",
          }}
        />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={handleDelete}
          onChangeColor={handleChangeColor}
          currentColor={color}
        />
      )}
    </>
  );
};

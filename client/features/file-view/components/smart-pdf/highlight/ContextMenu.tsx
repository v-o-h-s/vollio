import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Color palette for changing highlight colors
export const HIGHLIGHT_COLORS = [
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

export const ContextMenu = ({
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
    <Card
      ref={menuRef}
      className="fixed z-[9999] py-1 min-w-[200px]"
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
      <Separator className="my-1" />

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
    </Card>
  );
};

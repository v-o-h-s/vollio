"use client";

import { useHighlightContainerContext } from "react-pdf-highlighter-extended";
import { TextHighlight } from "react-pdf-highlighter-extended";
import { useState, useRef, useEffect } from "react";

import toast from "react-hot-toast";
import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import { Button, Card } from "@/components/ui";
import { MyHighlight } from "../BetterViewer";
import { ContextMenu } from "./ContextMenu";
// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface HighlightContainerProps {
  updateHighlight: (
    highlightId: string,
    highlight: Partial<CreateHighlightDto>
  ) => any;
  deleteHighlight: (highlightId: string) => any;
}

export const HighlightContainer = ({
  updateHighlight,
  deleteHighlight,
}: HighlightContainerProps) => {
  const { highlight, isScrolledTo } =
    useHighlightContainerContext<MyHighlight>();

  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (!highlight) return null;

  // Access custom properties
  const color = (highlight as any).color;
  const style = (highlight as any).style || "highlight";
  const tags = (highlight as any).tags;

  // Adjust opacity based on hover state
  const baseOpacity = 0.4;
  const hoveredOpacity = 0.25;
  const currentOpacity = isHovered ? hoveredOpacity : baseOpacity;

  const getHighlightStyle = () => {
    const baseColor = color || "#FFEB3B";
    const rgbaColor = hexToRgba(baseColor, currentOpacity);

    switch (style) {
      case "underline":
        return {
          borderBottom: `2px solid ${baseColor}`,
          backgroundColor: "transparent",
        };
      case "tagged":
        return {
          backgroundColor: rgbaColor,
          border: `2px solid ${baseColor}`,
          borderRadius: "12px", // Circular border effect
        };
      default: // "highlight"
        return {
          backgroundColor: rgbaColor,
        };
    }
  };

  const highlightStyle = getHighlightStyle();

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
      await deleteHighlight(highlight.id);
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
    await updateHighlight(highlight.id, { color: newColor });
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
            ...highlightStyle,
            mixBlendMode: "multiply",
            transition: "all 0.2s ease",
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

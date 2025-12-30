import { TextHighlight } from "react-pdf-highlighter-extended-plus";
import { MyHighlight } from "@/features/document-view/types/highlight";
import { useState } from "react";

interface StandardHighlightProps {
  highlight: MyHighlight;
  isScrolledTo: boolean;
  color: string;
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
}: StandardHighlightProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Adjust opacity based on hover state
  const baseOpacity = 0.4;
  const hoveredOpacity = 0.25;
  const currentOpacity = isHovered ? hoveredOpacity : baseOpacity;

  const rgbaColor = hexToRgba(color, currentOpacity);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TextHighlight
        highlight={highlight as any}
        isScrolledTo={isScrolledTo}
        style={{
          backgroundColor: rgbaColor,
          mixBlendMode: "multiply",
          transition: "all 0.2s ease",
        }}
      />
    </div>
  );
};

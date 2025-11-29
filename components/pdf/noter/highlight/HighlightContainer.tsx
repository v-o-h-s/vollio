import { useHighlightContainerContext } from "react-pdf-highlighter-extended";
import { TextHighlight } from "react-pdf-highlighter-extended";
import { HighlightWithColor } from "../BetterViewer";

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number = 0.4): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const HighlightContainer = () => {
  const { highlight, isScrolledTo } =
    useHighlightContainerContext<HighlightWithColor>();

  if (!highlight) return null;

  // Access custom properties
  const color = (highlight as any).color;

  const backgroundColor = color
    ? hexToRgba(color, 0.4)
    : "rgba(255, 235, 59, 0.4)";

  return (
    <TextHighlight
      highlight={highlight}
      isScrolledTo={isScrolledTo}
      style={{
        backgroundColor,
        mixBlendMode: "multiply",
      }}
    />
  );
};

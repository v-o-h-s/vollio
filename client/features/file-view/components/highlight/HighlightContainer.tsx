"use client";

// SSR safeguard for pdf.js evaluation
if (typeof window === "undefined") {
  (global as any).window = {};
  (global as any).document = {
    documentElement: {
      style: {},
    },
  };
  (global as any).navigator = {
    userAgent: "",
  };
}

import { useHighlightContainerContext } from "react-pdf-highlighter-extended-plus";
import { useState } from "react";
import toast from "react-hot-toast";
import { CreateHighlightDTO } from "@shared/validation/highlightSchemas";
import { ContextMenu } from "./ContextMenu";
import { StandardHighlight } from "./StandardHighlight";
import { TaggedHighlight } from "../tags/TaggedHighlight";
import { MyHighlight } from "@/lib/types/highlight";

interface HighlightContainerProps {
  updateHighlight: (
    highlightId: string,
    highlight: Partial<CreateHighlightDTO>
  ) => any;
  deleteHighlight: (highlightId: string) => any;
}

export const HighlightContainer = ({
  updateHighlight,
  deleteHighlight,
}: HighlightContainerProps) => {
  const { highlight, isScrolledTo } =
    useHighlightContainerContext<MyHighlight>();
  // console.log(highlight);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (!highlight) return null;

  // Access custom properties
  const color = (highlight as any).color || "#FFEB3B";
  const style = (highlight as any).style || "highlight";

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

  // Render different highlight types based on style
  const renderHighlight = () => {
    switch (style) {
      case "tagged":
        return (
          <TaggedHighlight
            highlight={highlight as any}
            isScrolledTo={isScrolledTo}
            color={color}
            updateHighlight={updateHighlight}
            deleteHighlight={deleteHighlight}
          />
        );
      default: // "highlight"
        return (
          <StandardHighlight
            highlight={highlight as any}
            isScrolledTo={isScrolledTo}
            color={color}
          />
        );
    }
  };

  return (
    <>
      <div onContextMenu={handleContextMenu} style={{ cursor: "pointer" }}>
        {renderHighlight()}
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

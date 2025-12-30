"use client";

// SSR safeguard for document.js evaluation
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
import { toast } from "react-toastify";
import { CreateHighlightDTO } from "@vollio/shared";
import { ContextMenu } from "./ContextMenu";
import { StandardHighlight } from "./StandardHighlight";
import { TaggedHighlight } from "../tags/TaggedHighlight";
import { InsightHighlight } from "./InsightHighlight";
import { MyHighlight } from "@/features/document-view/types/highlight";
import { useViewer } from "../../context/ViewerContext";

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
  // the hoook just change the key position from (x1,x2) to (top,bottom) and provide you with utils
  const { highlight, isScrolledTo } =
    useHighlightContainerContext<MyHighlight>();
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
        autoClose: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to delete highlight", {
        autoClose: 3000,
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
      case "insight":
        return (
          <InsightHighlight
            highlight={highlight as any}
            isScrolledTo={isScrolledTo}
            color="#8B5CF6"
            onNavigateToInsight={() => {
              // Navigate to noter and show the associated note
              // The noteId should be stored in the highlight
              if (highlight.noteId) {
                // This will be handled by the viewer context
                console.log("Navigate to insight note:", highlight.noteId);
              }
            }}
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

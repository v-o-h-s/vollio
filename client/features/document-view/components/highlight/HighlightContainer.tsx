"use client";

/**
 *  @important
 *  this component opens different portal so it cannot use contexts
 */

import { useHighlightContainerContext } from "react-pdf-highlighter-extended-plus";
import { useState } from "react";
import { toast } from "react-toastify";
import { CreateHighlightDTO, Tag } from "@vollio/shared";
import { ContextMenu } from "./ContextMenu";
import { StandardHighlight } from "./StandardHighlight";
import { TaggedHighlight } from "./TaggedHighlight";
import { InsightHighlight } from "./InsightHighlight";
import { NoteHighlight } from "./NoteHighlight";
import { MyHighlight } from "@/features/document-view/types/highlight";
import { useViewer } from "../../context/ViewerContext";

interface HighlightContainerProps {
  updateHighlight: (
    highlightId: string,
    highlight: Partial<CreateHighlightDTO>
  ) => any;
  deleteHighlight: (highlightId: string) => any;
  
  onClickHighlights: (noteId: string) => void;
  userTags?: Tag[];
}

export const HighlightContainer = ({
  updateHighlight,
  deleteHighlight,
  onClickHighlights,
  userTags = [],
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
    } catch (error) {
      toast.error("Failed to delete highlight", {
        autoClose: 3000,
        position: "bottom-right",
      });
      console.error("Failed to delete highlight:", error);
    }
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
            userTags={userTags}
          />
        );
      case "insight":
        return (
          <InsightHighlight
            onClickHighlights={onClickHighlights}
            highlight={highlight as any}
            isScrolledTo={isScrolledTo}
            color="#8B5CF6"
          />
        );
      case "note":
        return (
          <NoteHighlight
            highlight={highlight as any}
            isScrolledTo={isScrolledTo}
            color="#4F46E5"
            updateHighlight={updateHighlight}
          />
        );
      default: // "highlight"
        return (
          <StandardHighlight
            highlight={highlight as any}
            isScrolledTo={isScrolledTo}
            color={color}
            onClickHighlights={onClickHighlights}
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
        />
      )}
    </>
  );
};

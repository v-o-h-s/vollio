import { useRef } from "react";
import { DragEndEvent } from "@dnd-kit/core";

export function useDragMove({
  handleDragEnd,
  moveDocument,
  refetchDocuments,
  refetchFolders,
}: {
  handleDragEnd: (
    event: DragEndEvent,
    onMove: (
      itemType: "document" | "folder",
      itemId: string,
      targetFolderId: string | null,
    ) => void,
  ) => void;
  moveDocument: (id: string, folderId: string | null) => Promise<any>;
  refetchDocuments: () => void;
  refetchFolders: () => void;
}) {
  const handleDragEndWithMove = (event: any) => {
    handleDragEnd(event, async (itemType, itemId, targetFolderId) => {
      if (targetFolderId) {
        const cleanTargetFolderId = targetFolderId.replace(/^folder-/, "");
        console.log(
          "moving ",
          itemType,
          " from ",
          itemId,
          " to ",
          cleanTargetFolderId,
        );
        await moveDocument(itemId, cleanTargetFolderId);
        await Promise.all([refetchDocuments(), refetchFolders()]);
      }
    });
  };

  return { handleDragEndWithMove };
}

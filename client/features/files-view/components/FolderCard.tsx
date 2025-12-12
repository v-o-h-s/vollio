"use client";

import { useState } from "react";
import { Folder, MoreVertical, Edit, Trash2, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFolder } from "../hooks/useFolder";
import { RenameDialog } from "./dialogs/RenameDialog";
import { MoveItemDialog } from "./dialogs/MoveItemDialog";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

interface FolderCardProps {
  id: string;
  name: string;
  parentId?: string | null;
  isSelected: boolean;
  isDraggedOver?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  allFolders: { id: string; name: string; parent_id?: string | null }[];
}

export function FolderCard({
  id,
  name,
  parentId,
  isSelected,
  isDraggedOver,
  onSelect,
  onOpen,
  allFolders,
}: FolderCardProps) {
  const { renameFolder, moveFolder, deleteFolder } = useFolder();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
    <div
      className={`relative group rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-950 border-blue-500"
          : isDraggedOver
          ? "bg-blue-100 dark:bg-blue-900 border-blue-400"
          : "bg-card"
      }`}
      onClick={onSelect}
      onDoubleClick={onOpen}
    >
      <div className="flex flex-col items-center gap-2">
        <Folder className="h-12 w-12 text-blue-600" />
        <p className="text-sm text-center truncate w-full" title={name}>
          {name}
        </p>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMoveDialogOpen(true)}>
            <MoveRight className="h-4 w-4 mr-2" />
            Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        onSubmit={async (newName) => {
          await renameFolder(id, newName);
        }}
        currentName={name}
        type="folder"
      />
      
      <MoveItemDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        onSubmit={async (targetFolderId) => {
          await moveFolder(id, targetFolderId);
        }}
        folders={allFolders}
        currentFolderId={parentId}
        itemType="folder"
        itemName={name}
      />
      
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          await deleteFolder(id, true);
        }}
        noteTitle={name}
      />
    </>
  );
}

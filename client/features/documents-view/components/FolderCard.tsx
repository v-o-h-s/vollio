"use client";

import { useState } from "react";
import { MoreVertical, Edit, Trash2, MoveRight, Loader2 } from "lucide-react";
import { FaFolderOpen } from "react-icons/fa";
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
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { cn } from "@/lib/utils";

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
  const { renameFolder, moveFolder, deleteFolder, refetch } = useFolder();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <>
      <div
        className={cn(
          `relative group flex flex-col justify-center h-[140px] w-[140px] cursor-pointer transition-all hover:shadow-md hover:bg-muted/5 rounded-2xl ${
            isSelected ? "bg-blue-50 dark:bg-blue-950 border-blue-500 " : ""
          }`
        )}
        onClick={onSelect}
        onDoubleClick={onOpen}
      >
        <div className="flex flex-col items-center gap-4">
          <FaFolderOpen className="h-12 w-12 text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors" />
          <p
            className="text-sm text-center font-bold px-2 line-clamp-2 wrap-break-word w-full"
            title={name}
          >
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

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Folder"
        message={`Are you sure you want to delete the folder "${name}"? This action cannot be undone.`}
        description="This folder and all its contents will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        style="destructive"
        isLoading={isDeleting}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            const result = await deleteFolder(id);
            if (result.error) {
              console.error("Failed to delete folder:", result.error);
            } else {
              await refetch();
              setDeleteDialogOpen(false);
            }
          } catch (error) {
            console.error("Delete error:", error);
          } finally {
            setIsDeleting(false);
          }
        }}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteDialogOpen(false);
          }
        }}
      />
    </>
  );
}

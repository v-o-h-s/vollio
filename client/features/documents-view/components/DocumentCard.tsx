"use client";

import { useState } from "react";
import {
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  MoveRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocument } from "../hooks/useDocument";
import { RenameDialog } from "./dialogs/RenameDialog";
import { MoveItemDialog } from "./dialogs/MoveItemDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
interface DocumentCardProps {
  id: string;
  name: string;
  folderId?: string | null;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  allFolders: { id: string; name: string; parent_id?: string | null }[];
}

export function DocumentCard({
  id,
  name,
  folderId,
  isSelected,
  onSelect,
  onOpen,
  allFolders,
}: DocumentCardProps) {
  const { renameDocument, moveDocument, deleteDocument, refetch } =
    useDocument();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDocumentHandler = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDocument(id);
      if (result.error) {
        console.error("Failed to delete document:", result.error);
      } else {
        await refetch();
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <div
        className={`relative group flex flex-col justify-center h-[140px] w-[140px] cursor-pointer transition-all hover:shadow-md hover:bg-muted/5 rounded-2xl ${
          isSelected ? "bg-blue-50 dark:bg-blue-950 border-blue-500 " : ""
        }`}
        onClick={onSelect}
        onDoubleClick={onOpen}
      >
        <div className="flex flex-col items-center gap-4">
          <FileText className="h-12 w-12 group-hover:text-primary transition-colors" />
          <p
            className="text-sm text-center font-bold px-2 line-clamp-2 wrap-break-word w-full"
            title={name}
          >
            {name}
          </p>
        </div>
        {/* Dropdown Menu */}
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
      {/** rename dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        onSubmit={async (newName) => {
          await renameDocument(id, newName);
        }}
        currentName={name}
        type="document"
      />
      {/** move dialog */}
      <MoveItemDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        onSubmit={async (targetFolderId) => {
          await moveDocument(id, targetFolderId);
          await refetch();
        }}
        folders={allFolders}
        currentFolderId={folderId}
        itemType="document"
        itemName={name}
      />
      {/** confirmation for deleting */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Document"
        message={`Are you sure you want to delete the document "${name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        style="destructive"
        isLoading={isDeleting}
        onConfirm={() => deleteDocumentHandler()}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteDialogOpen(false);
          }
        }}
      />
    </>
  );
}

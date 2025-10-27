"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface DeleteHighlightDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Function called when delete is confirmed */
  onConfirm: (deleteNote: boolean) => void;
  /** Whether the highlight is linked to a note */
  hasLinkedNote: boolean;
  /** Whether the delete operation is in progress */
  isDeleting?: boolean;
}

export function DeleteHighlightDialog({
  open,
  onClose,
  onConfirm,
  hasLinkedNote,
  isDeleting = false,
}: DeleteHighlightDialogProps) {
  const [deleteNote, setDeleteNote] = React.useState(false);

  const handleConfirm = () => {
    onConfirm(deleteNote);
  };

  const handleClose = () => {
    setDeleteNote(false);
    onClose();
  };

  return (
    <div style={{ zIndex: 999999, position: 'relative' }}>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent 
          className="sm:max-w-md" 
          style={{ zIndex: 999999 }}
        >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
            Delete Highlight
          </DialogTitle>
          <DialogDescription>
            {hasLinkedNote
              ? "This highlight is linked to a note. Are you sure you want to delete it?"
              : "Are you sure you want to delete this highlight? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {hasLinkedNote && (
          <div className="py-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteNote}
                onChange={(e) => setDeleteNote(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                disabled={isDeleting}
              />
              <span className="text-sm text-muted-foreground">
                Also delete the linked note (this cannot be undone)
              </span>
            </label>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Highlight
                {deleteNote && " & Note"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
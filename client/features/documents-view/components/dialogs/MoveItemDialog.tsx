"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Folder, Home, Loader2 } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
}

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (targetFolderId: string | null) => Promise<void>;
  folders: Folder[];
  currentFolderId?: string | null;
  itemType: "document" | "folder";
  itemName: string;
}

export function MoveItemDialog({
  open,
  onOpenChange,
  onSubmit,
  folders,
  currentFolderId,
  itemType,
  itemName,
}: MoveItemDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await onSubmit(selectedFolderId);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableFolders = folders.filter((f) => f.id !== currentFolderId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] lg:w-[40vw] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Move {itemType === "folder" ? "Folder" : "Document"}</DialogTitle>
            <DialogDescription>
              Select a destination for "{itemName}".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Destination</Label>
            <RadioGroup
              value={selectedFolderId || "root"}
              onValueChange={(value) =>
                setSelectedFolderId(value === "root" ? null : value)
              }
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="root" id="root" />
                <Label htmlFor="root" className="flex items-center gap-2 cursor-pointer">
                  <Home className="h-4 w-4" />
                  Root
                </Label>
              </div>
              {availableFolders.map((folder) => (
                <div key={folder.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={folder.id} id={folder.id} />
                  <Label
                    htmlFor={folder.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Folder className="h-4 w-4 text-blue-600" />
                    {folder.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> Moving...</> : "Move"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

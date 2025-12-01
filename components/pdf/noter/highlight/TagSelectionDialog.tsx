"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const PREDEFINED_TAGS = [
  "Definition",
  "Example",
  "Important detail",
  "Key idea",
  "To revisit",
  "Step / Process",
] as const;

interface TagSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedTags: string[]) => void;
  initialTags?: string[];
}

export const TagSelectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  initialTags = [],
}: TagSelectionDialogProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedTags);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedTags(initialTags);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            Select one or more tags to categorize this highlight.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            {PREDEFINED_TAGS.map((tag) => (
              <div
                key={tag}
                className="flex items-center space-x-3 rounded-md border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleToggleTag(tag)}
              >
                <Checkbox
                  id={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleToggleTag(tag)}
                  className="cursor-pointer"
                />
                <Label
                  htmlFor={tag}
                  className="flex-1 text-sm font-medium leading-none cursor-pointer"
                >
                  {tag}
                </Label>
              </div>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Selected tags ({selectedTags.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleToggleTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedTags.length === 0}>
            Add {selectedTags.length > 0 && `(${selectedTags.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

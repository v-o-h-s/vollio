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
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

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
  onConfirm: (selectedTags: string[]) => Promise<void>;
  initialTags?: string[];
}

export const TagSelectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  initialTags = [],
}: TagSelectionDialogProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm(selectedTags);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
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
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50"
                  }`}
                >
                  {selectedTags.includes(tag) && <Check className="h-3 w-3" />}
                </div>
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
          <Button
            onClick={handleConfirm}
            disabled={selectedTags.length === 0 || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Saving...
              </div>
            ) : (
              <>Add {selectedTags.length > 0 && `(${selectedTags.length})`}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

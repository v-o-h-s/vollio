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
import { Tag } from "@/lib/shared";

interface TagSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedTags: string[]) => Promise<void>;
  initialTags?: string[];
  userTags?: Tag[];
  isLoadingSettings?: boolean;
}

export const TagSelectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  initialTags = [],
  userTags = [],
  isLoadingSettings = false,
}: TagSelectionDialogProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const tags = userTags;

  const handleToggleTag = (tagLabel: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel) ? prev.filter((t) => t !== tagLabel) : [...prev, tagLabel]
    );
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(selectedTags);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
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
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            {isLoadingSettings ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : tags.length > 0 ? (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center space-x-3 rounded-md border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleToggleTag(tag.label)}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
                      selectedTags.includes(tag.label)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    }`}
                  >
                    {selectedTags.includes(tag.label) && <Check className="h-3 w-3" />}
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: tag.color }} 
                  />
                  <Label
                    className="flex-1 text-sm font-medium leading-none cursor-pointer"
                  >
                    {tag.label}
                  </Label>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tags found. Go to Settings to create some.
              </div>
            )}
          </div>

          {selectedTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Selected tags ({selectedTags.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagName) => {
                  const tag = tags.find(t => t.label === tagName);
                  return (
                    <Badge
                      key={tagName}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      style={{ 
                        borderLeft: tag ? `4px solid ${tag.color}` : undefined 
                      }}
                      onClick={() => handleToggleTag(tagName)}
                    >
                      {tagName} ×
                    </Badge>
                  );
                })}
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
            disabled={selectedTags.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
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

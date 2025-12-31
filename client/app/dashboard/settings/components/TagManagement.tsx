"use client";

import React, { useState, useEffect } from "react";
import { Tag } from "@vollio/shared";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/lib/store/apiSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Tags,
  Loader2,
  AlertCircle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const PRESET_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
];

export function TagManagement() {
  const { data: settings, isLoading, isError } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagLabel, setEditTagLabel] = useState("");
  const [editTagColor, setEditTagColor] = useState("");

  const handleAddTag = async () => {
    if (!newTagLabel.trim() || !settings) return;

    const newTag: Tag = {
      id: `custom-${Date.now()}`,
      label: newTagLabel.trim(),
      color: newTagColor,
      isDefault: false,
    };

    try {
      await updateSettings({
        ...settings,
        tags: [...settings.tags, newTag],
      }).unwrap();
      setNewTagLabel("");
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Failed to add tag:", err);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!settings) return;

    try {
      await updateSettings({
        ...settings,
        tags: settings.tags.filter((t) => t.id !== tagId),
      }).unwrap();
    } catch (err) {
      console.error("Failed to delete tag:", err);
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditTagLabel(tag.label);
    setEditTagColor(tag.color);
  };

  const cancelEditing = () => {
    setEditingTagId(null);
  };

  const handleUpdateTag = async (tagId: string) => {
    if (!editTagLabel.trim() || !settings) return;

    try {
      await updateSettings({
        ...settings,
        tags: settings.tags.map((t) =>
          t.id === tagId
            ? { ...t, label: editTagLabel.trim(), color: editTagColor }
            : t
        ),
      }).unwrap();
      setEditingTagId(null);
    } catch (err) {
      console.error("Failed to update tag:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-destructive">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load tags. Please try again later.</p>
      </div>
    );
  }

  const defaultTags = settings?.tags.filter((t) => t.isDefault) || [];
  const customTags = settings?.tags.filter((t) => !t.isDefault) || [];

  return (
    <Card className="border-border/50 bg-card/20 backdrop-blur-md shadow-xl overflow-hidden relative border-none">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Tags className="w-48 h-48" />
      </div>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Highlight Tags</CardTitle>
            <CardDescription>
              Manage tags for your document highlights and notes.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Choose a label and color for your new highlight tag.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="label">Tag Label</Label>
                  <Input
                    id="label"
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    placeholder="e.g., Critical Evidence"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          newTagColor === color
                            ? "border-primary"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTagColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTag}
                  disabled={!newTagLabel.trim() || isUpdating}
                  className="rounded-xl"
                >
                  {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <Separator className="opacity-50" />

        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Default Tags (Read-only)
            </h3>
            <p className="text-xs text-muted-foreground">
              These tags are available to all users and cannot be modified.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {defaultTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 opacity-80"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-medium text-sm">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Your Custom Tags
            </h3>
            <p className="text-xs text-muted-foreground">
              Create and manage your own personalized highlight categories.
            </p>
          </div>

          {customTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/50 bg-muted/10">
              <p className="text-sm text-muted-foreground italic">
                No custom tags yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {customTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between group p-3 rounded-xl bg-accent/20 border border-border/50 hover:bg-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {editingTagId === tag.id ? (
                      <div className="flex flex-col gap-3 w-full max-w-sm">
                        <Input
                          value={editTagLabel}
                          onChange={(e) => setEditTagLabel(e.target.value)}
                          className="h-8 rounded-lg"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                                editTagColor === color
                                  ? "border-primary"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditTagColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-semibold text-sm">{tag.label}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {editingTagId === tag.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() => handleUpdateTag(tag.id)}
                          disabled={isUpdating}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={cancelEditing}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          onClick={() => startEditing(tag)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTag(tag.id)}
                          disabled={isUpdating}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
